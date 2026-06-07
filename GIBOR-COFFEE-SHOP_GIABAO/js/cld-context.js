/* CLD integration - branch context and session state */
(function (window) {
  "use strict";

  var BRANCH_CONTEXT_KEY = "gibor_branch_context";
  var SESSION_ID_KEY = "gibor_reco_session_id";
  var DEFAULT_CITY = "hcm";
  var DEFAULT_BRANCH_BY_CITY = {
    hcm: "hcm1",
    hn: "hn1",
    dn: "dn1",
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function safeParseJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function normalizeCityCode(cityCode) {
    var value = String(cityCode || "").trim().toLowerCase();
    if (value.indexOf("hcm") === 0 || value.indexOf("sg") === 0) return "hcm";
    if (value.indexOf("hn") === 0) return "hn";
    if (value.indexOf("dn") === 0) return "dn";
    if (value === "hanoi") return "hn";
    if (value === "danang" || value === "da_nang") return "dn";
    if (value === "hochiminh" || value === "ho_chi_minh" || value === "sg") return "hcm";
    if (value !== "hcm" && value !== "hn" && value !== "dn") return DEFAULT_CITY;
    return value;
  }

  function getDefaultBranchId(cityCode) {
    var normalizedCity = normalizeCityCode(cityCode);
    if (
      window.GIBOR_BRANCH_UTILS &&
      typeof window.GIBOR_BRANCH_UTILS.getByCity === "function"
    ) {
      var cityBranches = window.GIBOR_BRANCH_UTILS.getByCity(normalizedCity);
      if (Array.isArray(cityBranches) && cityBranches.length > 0 && cityBranches[0].id) {
        return cityBranches[0].id;
      }
    }
    return DEFAULT_BRANCH_BY_CITY[normalizedCity] || DEFAULT_BRANCH_BY_CITY[DEFAULT_CITY];
  }

  function sanitizeBranchContext(rawContext) {
    var cityCode = normalizeCityCode(rawContext && rawContext.cityCode);
    var branchId = rawContext && rawContext.branchId ? String(rawContext.branchId) : "";
    if (!branchId) branchId = getDefaultBranchId(cityCode);

    return {
      cityCode: cityCode,
      branchId: branchId,
      source: (rawContext && rawContext.source) || "default",
      updatedAt: (rawContext && rawContext.updatedAt) || nowIso(),
    };
  }

  function saveContext(context) {
    var safeContext = sanitizeBranchContext(context);
    try {
      localStorage.setItem(BRANCH_CONTEXT_KEY, JSON.stringify(safeContext));
    } catch (error) {
      // no-op
    }
    return safeContext;
  }

  function getContext() {
    var raw = null;
    try {
      raw = localStorage.getItem(BRANCH_CONTEXT_KEY);
    } catch (error) {
      raw = null;
    }

    var parsed = safeParseJson(raw, null);
    if (!parsed || typeof parsed !== "object") {
      return saveContext({
        cityCode: DEFAULT_CITY,
        branchId: getDefaultBranchId(DEFAULT_CITY),
        source: "default",
      });
    }

    var safeContext = sanitizeBranchContext(parsed);
    if (
      safeContext.cityCode !== parsed.cityCode ||
      safeContext.branchId !== parsed.branchId ||
      safeContext.source !== parsed.source
    ) {
      return saveContext(safeContext);
    }

    return safeContext;
  }

  function setContext(nextContext) {
    return saveContext(nextContext || {});
  }

  function setContextByCity(cityCode, source) {
    var normalizedCity = normalizeCityCode(cityCode);
    return saveContext({
      cityCode: normalizedCity,
      branchId: getDefaultBranchId(normalizedCity),
      source: source || "selected",
    });
  }

  function setContextByBranch(branchId, cityCode, source) {
    var normalizedCity = normalizeCityCode(cityCode);
    var finalBranch = branchId || getDefaultBranchId(normalizedCity);
    return saveContext({
      cityCode: normalizedCity,
      branchId: finalBranch,
      source: source || "selected",
    });
  }

  function getSegment() {
    try {
      if (window.UserManager && typeof window.UserManager.isLoggedIn === "function") {
        if (!window.UserManager.isLoggedIn()) return "general";
      } else {
        return "general";
      }

      if (window.PointsManager && typeof window.PointsManager.getPoints === "function") {
        var points = Number(window.PointsManager.getPoints() || 0);
        if (points >= 1000) return "loyal";
      }

      return "member";
    } catch (error) {
      return "general";
    }
  }

  function getSessionId() {
    try {
      var existing = localStorage.getItem(SESSION_ID_KEY);
      if (existing) return existing;
    } catch (error) {
      // keep generating
    }

    var generated =
      "sess-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10);
    try {
      localStorage.setItem(SESSION_ID_KEY, generated);
    } catch (error) {
      // no-op
    }
    return generated;
  }

  function getCartSnapshot() {
    try {
      var rawCart = localStorage.getItem("giborCart");
      var cart = safeParseJson(rawCart, []);
      if (!Array.isArray(cart)) return [];
      return cart.map(function (item) {
        return {
          name: item.name || "",
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.price || 0),
          size: item.size || "",
        };
      });
    } catch (error) {
      return [];
    }
  }

  window.CldContext = {
    getBranchContext: getContext,
    setBranchContext: setContext,
    setBranchContextByCity: setContextByCity,
    setBranchContextByBranch: setContextByBranch,
    getDefaultBranchId: getDefaultBranchId,
    getSegment: getSegment,
    getSessionId: getSessionId,
    getCartSnapshot: getCartSnapshot,
  };
})(window);
