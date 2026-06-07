/* CLD integration - cart cross-sell widget */
(function (window, document) {
  "use strict";

  var WIDGET_ID = "cldCartRecommendationSection";
  var LIST_ID = "cldCartRecommendationList";
  var FALLBACK_IMAGE = "images/banner/uudai1.jpg";
  var refreshTimer = null;
  var refreshInFlight = false;

  function parseNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function getCart() {
    if (typeof window.getCart === "function") return window.getCart();
    try {
      var raw = localStorage.getItem("giborCart");
      var parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function formatCurrency(value) {
    return Math.max(0, Number(value || 0)).toLocaleString("vi-VN") + "\u0111";
  }

  function ensureWidgetContainer() {
    var existing = document.getElementById(WIDGET_ID);
    if (existing) return existing;

    var summary = document.querySelector(".cart-summary");
    if (!summary) return null;

    var section = document.createElement("section");
    section.id = WIDGET_ID;
    section.className = "cld-widget cld-widget-cart";
    section.hidden = true;
    section.innerHTML =
      '<div class="cld-widget-header">' +
      "<h3>Goi y mua kem cho gio hang</h3>" +
      "<p>Ban co the mo khoa uu dai neu them dung san pham goi y.</p>" +
      "</div>" +
      '<div class="cld-recommendation-grid cld-recommendation-grid-cart" id="' + LIST_ID + '"></div>';

    summary.insertAdjacentElement("beforebegin", section);
    return section;
  }

  function normalizeRecommendation(raw, index) {
    var items = [];
    if (Array.isArray(raw && raw.items)) {
      items = raw.items
        .map(function (entry) {
          if (typeof entry === "string") return entry;
          return entry && (entry.name || entry.itemName || entry.sku || entry.code) || "";
        })
        .filter(Boolean);
    }

    var originalPrice = parseNumber(raw && (raw.originalPrice || raw.original_price || raw.totalOriginalPrice), 0);
    var suggestedPrice = parseNumber(raw && (raw.suggestedPrice || raw.suggested_price || raw.price || raw.finalPrice), 0);
    var discountValue = parseNumber(raw && (raw.discountValue || raw.discount || raw.discountAmount), 0);
    if (!discountValue && originalPrice > 0 && suggestedPrice > 0) {
      discountValue = Math.max(0, originalPrice - suggestedPrice);
    }

    return {
      campaignId: raw && (raw.campaignId || raw.campaign_id || raw.id || "cart-campaign-" + index),
      candidateId: raw && (raw.candidateId || raw.candidate_id || raw.comboId || "cart-candidate-" + index),
      title: (raw && (raw.title || raw.name || raw.comboName)) || "Combo de xuat",
      description:
        (raw && (raw.reason || raw.description)) ||
        "Them 1 mon de kich hoat goi uu dai tu CLD-Miner.",
      items: items,
      image: (raw && (raw.image || raw.thumbnail || raw.banner)) || FALLBACK_IMAGE,
      discountType: (raw && (raw.discountType || raw.discount_type || "amount")) || "amount",
      discountValue: discountValue,
      suggestedPrice: suggestedPrice || originalPrice || 0,
      score: parseNumber(raw && raw.score, 0),
      position: index + 1,
    };
  }

  function buildCartItemFromRecommendation(recommendation) {
    return {
      name: recommendation.title,
      image: recommendation.image || FALLBACK_IMAGE,
      size: "M\u1eb7c \u0111\u1ecbnh",
      price: parseNumber(recommendation.suggestedPrice, 0) || 30000,
      sugar: "",
      ice: "",
      toppings: [],
      note: "Goi y CLD-Miner",
      comboItems: recommendation.items.slice(),
      quantity: 1,
    };
  }

  function addRecommendationToCart(recommendation) {
    var cart = getCart();
    var target = buildCartItemFromRecommendation(recommendation);
    var existingIndex = cart.findIndex(function (item) {
      return item.name === target.name && item.size === target.size && (item.note || "") === target.note;
    });

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
      if (!Array.isArray(cart[existingIndex].comboItems) || cart[existingIndex].comboItems.length === 0) {
        cart[existingIndex].comboItems = target.comboItems.slice();
      }
    } else {
      cart.push(target);
    }

    if (typeof window.saveCart === "function") {
      window.saveCart(cart);
    } else {
      localStorage.setItem("giborCart", JSON.stringify(cart));
    }

    if (typeof window.renderCart === "function") {
      window.renderCart();
    }

    if (typeof window.showToast === "function") {
      window.showToast('Da them "' + recommendation.title + '" vao gio hang!');
    }
  }

  function renderRecommendations(items) {
    var section = ensureWidgetContainer();
    if (!section) return;

    var listEl = section.querySelector("#" + LIST_ID);
    if (!listEl) return;

    if (!Array.isArray(items) || items.length === 0) {
      section.hidden = true;
      listEl.innerHTML = "";
      return;
    }

    section.hidden = false;
    listEl.innerHTML = items
      .map(function (item) {
        var itemList = item.items.length
          ? item.items.slice(0, 4).map(function (name) { return "<li>" + name + "</li>"; }).join("")
          : "<li>Them 1 mon phu hop de kich hoat combo</li>";

        var discountLabel =
          item.discountType === "percent"
            ? "-" + parseNumber(item.discountValue, 0) + "%"
            : "-" + formatCurrency(item.discountValue);

        return (
          '<article class="cld-recommendation-card">' +
          '<img class="cld-card-image" src="' +
          item.image +
          '" alt="' +
          item.title +
          '">' +
          '<div class="cld-card-body">' +
          '<div class="cld-card-top"><h4>' +
          item.title +
          '</h4><span class="cld-discount-badge">' +
          discountLabel +
          "</span></div>" +
          '<p class="cld-card-desc">' +
          item.description +
          "</p>" +
          '<ul class="cld-item-list">' +
          itemList +
          "</ul>" +
          '<div class="cld-card-bottom">' +
          '<span class="cld-price">' +
          formatCurrency(item.suggestedPrice) +
          "</span>" +
          '<button type="button" class="cld-btn-add" data-action="add" data-campaign-id="' +
          item.campaignId +
          '" data-candidate-id="' +
          item.candidateId +
          '">Them ngay</button>' +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    if (window.CldTracker) {
      items.forEach(function (item) {
        window.CldTracker.track({
          eventType: "impression",
          context: "cart",
          campaignId: item.campaignId,
          candidateId: item.candidateId,
          cartSnapshot: window.CldContext ? window.CldContext.getCartSnapshot() : [],
          metadata: { position: item.position },
        });
      });
    }

    listEl.querySelectorAll("[data-action='add']").forEach(function (button) {
      button.addEventListener("click", function () {
        var campaignId = button.getAttribute("data-campaign-id");
        var candidateId = button.getAttribute("data-candidate-id");
        var selected = items.find(function (entry) {
          return String(entry.campaignId) === String(campaignId) && String(entry.candidateId) === String(candidateId);
        });
        if (!selected) return;

        if (window.CldTracker) {
          window.CldTracker.track({
            eventType: "click",
            context: "cart",
            campaignId: selected.campaignId,
            candidateId: selected.candidateId,
            cartSnapshot: window.CldContext ? window.CldContext.getCartSnapshot() : [],
            metadata: { position: selected.position, action: "add_button" },
          });
        }

        addRecommendationToCart(selected);

        if (window.CldTracker) {
          window.CldTracker.track({
            eventType: "add_to_cart",
            context: "cart",
            campaignId: selected.campaignId,
            candidateId: selected.candidateId,
            cartSnapshot: window.CldContext ? window.CldContext.getCartSnapshot() : [],
            metadata: { position: selected.position, action: "cart_reco_add" },
          });
        }
      });
    });
  }

  async function loadRecommendations() {
    if (refreshInFlight) return;
    if (!window.CldApiClient || typeof window.CldApiClient.getRecommendationsCart !== "function") {
      return;
    }

    var cart = getCart();
    if (!Array.isArray(cart) || cart.length === 0) {
      renderRecommendations([]);
      return;
    }

    refreshInFlight = true;
    try {
      var context = window.CldContext ? window.CldContext.getBranchContext() : { branchId: "hcm1" };
      var segment = window.CldContext ? window.CldContext.getSegment() : "general";

      var result = await window.CldApiClient.getRecommendationsCart({
        branchId: context.branchId || "hcm1",
        segment: segment || "general",
      });

      if (!result.ok) {
        renderRecommendations([]);
        return;
      }

      var normalized = result.data.map(normalizeRecommendation).filter(function (entry) {
        return entry.campaignId && entry.candidateId;
      });

      renderRecommendations(normalized);
    } finally {
      refreshInFlight = false;
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(loadRecommendations, 300);
  }

  function patchCartRender() {
    if (window.__cldCartRenderPatched) return;
    if (typeof window.renderCart !== "function") return;

    var originalRenderCart = window.renderCart;
    window.renderCart = function () {
      var result = originalRenderCart.apply(this, arguments);
      scheduleRefresh();
      return result;
    };
    window.__cldCartRenderPatched = true;
  }

  function init() {
    if (!document.querySelector(".cart-container")) return;
    ensureWidgetContainer();
    patchCartRender();
    scheduleRefresh();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
