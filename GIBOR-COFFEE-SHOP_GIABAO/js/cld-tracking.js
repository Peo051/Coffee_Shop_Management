/* CLD integration - recommendation tracking queue */
(function (window) {
  "use strict";

  var QUEUE_KEY = "gibor_reco_tracking_queue";
  var SEEN_IMPRESSION_KEY = "gibor_reco_seen_impression";
  var ATTRIBUTION_KEY = "gibor_reco_attribution";
  var flushInFlight = false;

  function safeParseJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function readState(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return safeParseJson(raw, fallback);
    } catch (error) {
      return fallback;
    }
  }

  function writeState(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // no-op
    }
  }

  function getQueue() {
    var queue = readState(QUEUE_KEY, []);
    return Array.isArray(queue) ? queue : [];
  }

  function setQueue(queue) {
    writeState(QUEUE_KEY, Array.isArray(queue) ? queue : []);
  }

  function getSeenImpressions() {
    var map = readState(SEEN_IMPRESSION_KEY, {});
    return map && typeof map === "object" ? map : {};
  }

  function setSeenImpressions(map) {
    writeState(SEEN_IMPRESSION_KEY, map || {});
  }

  function getAttributionState() {
    var base = {
      sessionId: window.CldContext ? window.CldContext.getSessionId() : "",
      campaigns: {},
      updatedAt: new Date().toISOString(),
    };
    var state = readState(ATTRIBUTION_KEY, base);
    if (!state || typeof state !== "object") return base;
    if (!state.campaigns || typeof state.campaigns !== "object") state.campaigns = {};
    if (!state.sessionId && window.CldContext) state.sessionId = window.CldContext.getSessionId();
    return state;
  }

  function setAttributionState(state) {
    state.updatedAt = new Date().toISOString();
    writeState(ATTRIBUTION_KEY, state);
  }

  function makeImpressionToken(event) {
    return [event.sessionId || "", event.context || "", event.campaignId || "", event.candidateId || ""].join(":");
  }

  function shouldTrackImpression(event) {
    if (event.eventType !== "impression") return true;
    var token = makeImpressionToken(event);
    var seenMap = getSeenImpressions();
    if (seenMap[token]) return false;
    seenMap[token] = new Date().toISOString();
    setSeenImpressions(seenMap);
    return true;
  }

  function upsertAttribution(event) {
    if (!event || !event.campaignId) return;
    if (event.eventType !== "click" && event.eventType !== "add_to_cart") return;

    var state = getAttributionState();
    var campaignKey = String(event.campaignId);
    if (!state.campaigns[campaignKey]) {
      state.campaigns[campaignKey] = {
        campaignId: event.campaignId,
        candidateId: event.candidateId || null,
        contexts: [],
        engaged: false,
        eventCount: 0,
        lastEventType: "",
        updatedAt: "",
      };
    }

    var entry = state.campaigns[campaignKey];
    if (event.context && entry.contexts.indexOf(event.context) === -1) {
      entry.contexts.push(event.context);
    }
    entry.engaged = true;
    entry.eventCount += 1;
    entry.lastEventType = event.eventType;
    entry.updatedAt = new Date().toISOString();

    setAttributionState(state);
  }

  async function flushQueue() {
    if (flushInFlight) return false;
    if (!window.CldApiClient || typeof window.CldApiClient.trackRecommendationEvent !== "function") {
      return false;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return false;
    }

    flushInFlight = true;
    try {
      var queue = getQueue();
      while (queue.length > 0) {
        var nextEvent = queue[0];
        var result = await window.CldApiClient.trackRecommendationEvent(nextEvent);
        if (!result || !result.ok) break;
        queue.shift();
        setQueue(queue);
      }
    } finally {
      flushInFlight = false;
    }

    return true;
  }

  function normalizeEvent(payload) {
    var contextInfo = window.CldContext ? window.CldContext.getBranchContext() : {};
    var now = new Date().toISOString();
    return {
      eventType: payload.eventType,
      campaignId: payload.campaignId || null,
      candidateId: payload.candidateId || null,
      context: payload.context || "unknown",
      branchId: payload.branchId || contextInfo.branchId || null,
      cityCode: payload.cityCode || contextInfo.cityCode || null,
      segment: payload.segment || (window.CldContext ? window.CldContext.getSegment() : "general"),
      sessionId: payload.sessionId || (window.CldContext ? window.CldContext.getSessionId() : ""),
      cartSnapshot: payload.cartSnapshot || (window.CldContext ? window.CldContext.getCartSnapshot() : []),
      metadata: payload.metadata || {},
      timestamp: now,
    };
  }

  function queueEvent(payload) {
    if (!payload || !payload.eventType) return Promise.resolve(false);
    var event = normalizeEvent(payload);
    if (!shouldTrackImpression(event)) return Promise.resolve(false);

    var queue = getQueue();
    queue.push(event);
    setQueue(queue);
    upsertAttribution(event);
    return flushQueue();
  }

  function getEngagedCampaigns() {
    var state = getAttributionState();
    return Object.keys(state.campaigns)
      .map(function (key) {
        return state.campaigns[key];
      })
      .filter(function (entry) {
        return entry && entry.engaged && entry.campaignId;
      });
  }

  async function trackOrderAttribution(orderInfo) {
    var details = orderInfo || {};
    var campaigns = getEngagedCampaigns();
    if (campaigns.length === 0) return { ok: true, tracked: 0 };

    for (var i = 0; i < campaigns.length; i += 1) {
      var campaign = campaigns[i];
      await queueEvent({
        eventType: "order",
        context: details.context || "payment",
        campaignId: campaign.campaignId,
        candidateId: campaign.candidateId,
        metadata: {
          orderCode: details.orderCode || "",
          total: Number(details.total || 0),
          contexts: campaign.contexts || [],
        },
        cartSnapshot: details.cartSnapshot || (window.CldContext ? window.CldContext.getCartSnapshot() : []),
      });
    }

    // clear attribution after successful conversion emission
    setAttributionState({
      sessionId: window.CldContext ? window.CldContext.getSessionId() : "",
      campaigns: {},
      updatedAt: new Date().toISOString(),
    });

    return { ok: true, tracked: campaigns.length };
  }

  window.CldTracker = {
    track: queueEvent,
    flush: flushQueue,
    getEngagedCampaigns: getEngagedCampaigns,
    trackOrderAttribution: trackOrderAttribution,
  };

  window.addEventListener("online", function () {
    flushQueue();
  });

  setTimeout(function () {
    flushQueue();
  }, 1200);
})(window);
