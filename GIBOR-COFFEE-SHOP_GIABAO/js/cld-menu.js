/* CLD integration - menu recommendation widget */
(function (window, document) {
  "use strict";

  var WIDGET_ID = "cldMenuRecommendationSection";
  var LIST_ID = "cldMenuRecommendationList";
  var FALLBACK_IMAGE = "images/banner/uudai1.jpg";
  var dynamicComboMap = {};
  var pendingAddTracking = null;

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getCartSnapshot() {
    if (window.CldContext && typeof window.CldContext.getCartSnapshot === "function") {
      return window.CldContext.getCartSnapshot();
    }
    return [];
  }

  function parseNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizeRecommendation(raw, index) {
    var items = [];
    if (Array.isArray(raw && raw.items)) {
      items = raw.items.map(function (entry) {
        if (typeof entry === "string") return entry;
        return entry && (entry.name || entry.itemName || entry.sku || entry.code) || "";
      }).filter(Boolean);
    }

    var originalPrice = parseNumber(
      raw && (raw.originalPrice || raw.original_price || raw.totalOriginalPrice),
      0,
    );
    var suggestedPrice = parseNumber(
      raw && (raw.suggestedPrice || raw.suggested_price || raw.price || raw.finalPrice),
      0,
    );
    var discountValue = parseNumber(raw && (raw.discountValue || raw.discount || raw.discountAmount), 0);

    if (!discountValue && originalPrice > 0 && suggestedPrice > 0) {
      discountValue = Math.max(0, originalPrice - suggestedPrice);
    }

    return {
      campaignId: raw && (raw.campaignId || raw.campaign_id || raw.id || "menu-campaign-" + index),
      candidateId: raw && (raw.candidateId || raw.candidate_id || raw.comboId || "menu-candidate-" + index),
      title: (raw && (raw.title || raw.name || raw.comboName)) || "Combo de xuat",
      description: (raw && raw.description) || "Goi y duoc tao tu phan tich CLD-Miner.",
      items: items,
      image: (raw && (raw.image || raw.thumbnail || raw.banner)) || FALLBACK_IMAGE,
      discountType: (raw && (raw.discountType || raw.discount_type || "amount")) || "amount",
      discountValue: discountValue,
      suggestedPrice: suggestedPrice || originalPrice || 0,
      score: parseNumber(raw && raw.score, 0),
      position: index + 1,
    };
  }

  function formatCurrency(value) {
    return Math.max(0, Number(value || 0)).toLocaleString("vi-VN") + "\u0111";
  }

  function ensureWidgetContainer() {
    var existing = document.getElementById(WIDGET_ID);
    if (existing) return existing;

    var titleEl = document.querySelector(".menu-title");
    if (!titleEl) return null;

    var section = document.createElement("section");
    section.id = WIDGET_ID;
    section.className = "cld-widget cld-widget-menu";
    section.hidden = true;
    section.innerHTML =
      '<div class="cld-widget-header">' +
      '<h3>Combo de xuat hom nay</h3>' +
      '<p>Duoc ca nhan hoa theo chi nhanh va hanh vi mua sam.</p>' +
      "</div>" +
      '<div class="cld-recommendation-grid" id="' + LIST_ID + '"></div>';

    titleEl.insertAdjacentElement("afterend", section);
    return section;
  }

  function registerDynamicCombo(name, items) {
    if (!name) return;
    dynamicComboMap[normalizeText(name)] = Array.isArray(items) ? items.slice() : [];
  }

  function patchComboLookup() {
    if (window.__cldMenuComboPatched) return;
    if (typeof window.getComboItemsByName !== "function") return;

    var originalGetComboItems = window.getComboItemsByName;
    window.getComboItemsByName = function (productName) {
      var key = normalizeText(productName);
      if (dynamicComboMap[key] && dynamicComboMap[key].length > 0) {
        return dynamicComboMap[key].slice();
      }
      return originalGetComboItems(productName);
    };

    window.__cldMenuComboPatched = true;
  }

  function patchAddToCartTracking() {
    if (window.__cldMenuAddTrackingPatched) return;
    if (typeof window.addToCart !== "function") return;

    var originalAddToCart = window.addToCart;
    window.addToCart = function () {
      var before = localStorage.getItem("giborCart") || "[]";
      var popupNameEl = document.getElementById("popup-name");
      var popupProductName = popupNameEl ? normalizeText(popupNameEl.textContent) : "";
      var result = originalAddToCart.apply(this, arguments);

      setTimeout(function () {
        if (!pendingAddTracking) return;
        var after = localStorage.getItem("giborCart") || "[]";
        var pendingName = normalizeText(pendingAddTracking.title);
        var canTrack = popupProductName && pendingName && popupProductName === pendingName;
        if (before !== after && canTrack && window.CldTracker) {
          window.CldTracker.track({
            eventType: "add_to_cart",
            context: "menu",
            campaignId: pendingAddTracking.campaignId,
            candidateId: pendingAddTracking.candidateId,
            cartSnapshot: getCartSnapshot(),
            metadata: {
              position: pendingAddTracking.position,
              title: pendingAddTracking.title,
            },
          });
        }
        pendingAddTracking = null;
      }, 0);

      return result;
    };

    window.__cldMenuAddTrackingPatched = true;
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
          : "<li>Combo phu hop voi gio hang hien tai</li>";
        var discountLabel =
          item.discountType === "percent"
            ? "-" + parseNumber(item.discountValue, 0) + "%"
            : "-" + formatCurrency(item.discountValue);

        return (
          '<article class="cld-recommendation-card" data-campaign-id="' +
          item.campaignId +
          '" data-candidate-id="' +
          item.candidateId +
          '">' +
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
          '">Them combo</button>' +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    // Track impression once per card in session.
    if (window.CldTracker) {
      items.forEach(function (item) {
        window.CldTracker.track({
          eventType: "impression",
          context: "menu",
          campaignId: item.campaignId,
          candidateId: item.candidateId,
          cartSnapshot: getCartSnapshot(),
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
            context: "menu",
            campaignId: selected.campaignId,
            candidateId: selected.candidateId,
            cartSnapshot: getCartSnapshot(),
            metadata: { position: selected.position, action: "open_popup" },
          });
        }

        registerDynamicCombo(selected.title, selected.items);
        pendingAddTracking = selected;
        var price = parseNumber(selected.suggestedPrice, 0);
        if (typeof window.openPopup === "function") {
          window.openPopup(selected.title, selected.image || FALLBACK_IMAGE, price || 30000, "food");
          return;
        }

        // Fallback: add directly if popup is not available.
        var cart = JSON.parse(localStorage.getItem("giborCart") || "[]");
        cart.push({
          name: selected.title,
          image: selected.image || FALLBACK_IMAGE,
          size: "M\u1eb7c \u0111\u1ecbnh",
          price: price || 30000,
          sugar: "",
          ice: "",
          toppings: [],
          note: "Goi y CLD-Miner",
          comboItems: selected.items.slice(),
          quantity: 1,
        });
        localStorage.setItem("giborCart", JSON.stringify(cart));

        if (typeof window.showPopupToast === "function") {
          window.showPopupToast('Da them "' + selected.title + '" vao gio hang!');
        }

        if (window.CldTracker) {
          window.CldTracker.track({
            eventType: "add_to_cart",
            context: "menu",
            campaignId: selected.campaignId,
            candidateId: selected.candidateId,
            cartSnapshot: getCartSnapshot(),
            metadata: { position: selected.position, action: "direct_add" },
          });
        }
      });
    });
  }

  async function loadMenuRecommendations() {
    if (!window.CldApiClient || typeof window.CldApiClient.getRecommendationsMenu !== "function") {
      return;
    }

    var context = window.CldContext ? window.CldContext.getBranchContext() : { branchId: "hcm1" };
    var segment = window.CldContext ? window.CldContext.getSegment() : "general";

    var result = await window.CldApiClient.getRecommendationsMenu({
      branchId: context.branchId || "hcm1",
      segment: segment || "general",
    });

    if (!result.ok) {
      renderRecommendations([]);
      return;
    }

    var normalized = result.data.map(normalizeRecommendation).filter(function (item) {
      return item.campaignId && item.candidateId;
    });

    renderRecommendations(normalized);
  }

  function init() {
    if (!document.querySelector(".menu-container")) return;
    ensureWidgetContainer();
    patchComboLookup();
    patchAddToCartTracking();
    loadMenuRecommendations();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
