/* CLD integration - API client */
(function (window) {
  "use strict";

  var API_CONFIG_KEY = "gibor_api_config";
  var DEFAULT_BASE_URL = "/api";
  var DEFAULT_TIMEOUT_MS = 7000;

  function safeParseJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function getBaseUrl() {
    if (typeof window.GIBOR_API_BASE === "string" && window.GIBOR_API_BASE.trim()) {
      return window.GIBOR_API_BASE.trim().replace(/\/+$/, "");
    }

    try {
      var rawConfig = localStorage.getItem(API_CONFIG_KEY);
      var config = safeParseJson(rawConfig, {});
      if (config && typeof config.baseUrl === "string" && config.baseUrl.trim()) {
        return config.baseUrl.trim().replace(/\/+$/, "");
      }
    } catch (error) {
      // keep default
    }

    return DEFAULT_BASE_URL;
  }

  function isAbsoluteUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function buildUrl(path, query) {
    var normalizedPath = String(path || "").trim();
    if (!normalizedPath) normalizedPath = "/";
    if (normalizedPath[0] !== "/") normalizedPath = "/" + normalizedPath;

    var baseUrl = getBaseUrl();
    var fullUrl = isAbsoluteUrl(normalizedPath) ? normalizedPath : baseUrl + normalizedPath;
    var url = new URL(fullUrl, window.location.origin);

    if (query && typeof query === "object") {
      Object.keys(query).forEach(function (key) {
        var value = query[key];
        if (value === undefined || value === null || value === "") return;
        url.searchParams.set(key, String(value));
      });
    }

    return url.toString();
  }

  async function parseResponse(response) {
    var contentType = response.headers.get("content-type") || "";
    if (contentType.indexOf("application/json") >= 0) {
      return response.json();
    }

    var text = await response.text();
    return text ? { message: text } : {};
  }

  async function fetchWithTimeout(url, options, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    try {
      var requestOptions = Object.assign({}, options, { signal: controller.signal });
      return await fetch(url, requestOptions);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function request(path, options) {
    var opts = options || {};
    var method = (opts.method || "GET").toUpperCase();
    var retries = Number.isFinite(opts.retries) ? Math.max(0, opts.retries) : 1;
    var timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;
    var headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    var url = buildUrl(path, opts.query);
    var body = opts.body;

    if (body !== undefined && body !== null && typeof body === "object" && !(body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(body);
    }

    var attempt = 0;
    var lastError = null;
    while (attempt <= retries) {
      try {
        var response = await fetchWithTimeout(
          url,
          {
            method: method,
            headers: headers,
            body: body,
            credentials: "same-origin",
          },
          timeoutMs,
        );

        var payload = await parseResponse(response);
        if (!response.ok) {
          return {
            ok: false,
            status: response.status,
            data: payload,
            error:
              (payload && (payload.message || payload.error || payload.title)) ||
              "Request failed (" + response.status + ")",
          };
        }

        return { ok: true, status: response.status, data: payload };
      } catch (error) {
        lastError = error;
        if (attempt === retries) break;
      }

      attempt += 1;
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error:
        (lastError && lastError.name === "AbortError" && "Request timeout") ||
        (lastError && lastError.message) ||
        "Network error",
    };
  }

  function normalizeRecommendationList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && data.result && Array.isArray(data.result.items)) return data.result.items;
    return [];
  }

  var api = {
    getBaseUrl: getBaseUrl,
    request: request,

    async getRecommendationsMenu(params) {
      var query = {
        branchId: params && params.branchId,
        segment: (params && params.segment) || "general",
      };
      var result = await request("/recommendations/menu", {
        method: "GET",
        query: query,
        retries: 1,
      });
      if (!result.ok) return { ok: false, data: [], error: result.error };
      return { ok: true, data: normalizeRecommendationList(result.data) };
    },

    async getRecommendationsCart(params) {
      var query = {
        branchId: params && params.branchId,
        segment: (params && params.segment) || "general",
      };
      var result = await request("/recommendations/cart", {
        method: "GET",
        query: query,
        retries: 1,
      });
      if (!result.ok) return { ok: false, data: [], error: result.error };
      return { ok: true, data: normalizeRecommendationList(result.data) };
    },

    async trackRecommendationEvent(payload) {
      return request("/recommendations/track", {
        method: "POST",
        body: payload || {},
        retries: 1,
      });
    },

    async previewCheckout(payload) {
      return request("/checkout/price-preview", {
        method: "POST",
        body: payload || {},
        retries: 1,
      });
    },

    async createOrder(payload) {
      return request("/orders", {
        method: "POST",
        body: payload || {},
        retries: 0,
      });
    },
  };

  window.CldApiClient = api;
})(window);
