/* CLD integration - payment/checkout sync */
(function (window, document) {
  "use strict";

  var lastPreview = null;

  function getElement(id) {
    return document.getElementById(id);
  }

  function parseNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function formatCurrency(value) {
    var amount = Math.max(0, Number(value || 0));
    return amount.toLocaleString("vi-VN") + "\u0111";
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

  function getSubtotal(cart) {
    return (cart || []).reduce(function (sum, item) {
      return sum + parseNumber(item.price, 0) * parseNumber(item.quantity, 0);
    }, 0);
  }

  function getShippingMethod() {
    return typeof selectedShipping !== "undefined" ? selectedShipping : "delivery";
  }

  function getPaymentMethod() {
    return typeof selectedPayment !== "undefined" ? selectedPayment : "cod";
  }

  function getCurrentBranchContext() {
    if (window.CldContext && typeof window.CldContext.getBranchContext === "function") {
      return window.CldContext.getBranchContext();
    }
    return { cityCode: "hcm", branchId: "hcm1" };
  }

  function inferCityCodeFromBranchId(branchId) {
    var value = String(branchId || "").trim().toLowerCase();
    if (value.indexOf("hcm") === 0) return "hcm";
    if (value.indexOf("hn") === 0) return "hn";
    if (value.indexOf("dn") === 0) return "dn";
    return "hcm";
  }

  function setBranchContextByCheckout() {
    if (!window.CldContext) return;

    var shippingMethod = getShippingMethod();
    if (shippingMethod === "dine-in" && typeof selectedBranch !== "undefined" && selectedBranch && selectedBranch.id) {
      var cityByBranch = inferCityCodeFromBranchId(selectedBranch.id);
      window.CldContext.setBranchContextByBranch(selectedBranch.id, cityByBranch, "checkout");
      return;
    }

    var citySelect = getElement("ckCity");
    var selectedCity = citySelect ? citySelect.value : "";
    if (selectedCity) {
      window.CldContext.setBranchContextByCity(selectedCity, "checkout");
    }
  }

  function collectCustomerForm() {
    var ckNameEl = getElement("ckName");
    var ckPhoneEl = getElement("ckPhone");
    var ckEmailEl = getElement("ckEmail");
    var ckAddressEl = getElement("ckAddress");
    var ckCityEl = getElement("ckCity");
    var ckWardEl = getElement("ckWard");
    var ckNoteEl = getElement("ckNote");

    var fullAddress = "";
    if (getShippingMethod() === "delivery") {
      var streetAddr = ckAddressEl ? ckAddressEl.value.trim() : "";
      var wardName = ckWardEl && ckWardEl.selectedIndex >= 0 ? ckWardEl.options[ckWardEl.selectedIndex].text : "";
      var cityName = ckCityEl && ckCityEl.selectedIndex >= 0 ? ckCityEl.options[ckCityEl.selectedIndex].text : "";
      fullAddress = [streetAddr, wardName, cityName]
        .filter(function (part) {
          return part && part !== "--- Chon ---";
        })
        .join(", ");
    }

    return {
      name: ckNameEl ? ckNameEl.value.trim() : "",
      phone: ckPhoneEl ? ckPhoneEl.value.trim() : "",
      email: ckEmailEl ? ckEmailEl.value.trim() : "",
      address: fullAddress,
      note: ckNoteEl ? ckNoteEl.value.trim() : "",
      cityCode: ckCityEl ? ckCityEl.value : "",
      wardCode: ckWardEl ? ckWardEl.value : "",
    };
  }

  function normalizePreview(data, payload) {
    var pricing = (data && data.pricing) || {};
    var subtotal = parseNumber(
      data && (data.subtotal || pricing.subtotal),
      parseNumber(payload.subtotal, 0),
    );
    var couponDiscount = parseNumber(
      data && (data.couponDiscount || data.discountAmount || pricing.couponDiscount),
      parseNumber(payload.couponDiscount, 0),
    );
    var pointsDiscountValue = parseNumber(
      data && (data.pointsDiscount || pricing.pointsDiscount),
      parseNumber(payload.pointsDiscount, 0),
    );
    var shippingFee = parseNumber(
      data && (data.shippingFee || pricing.shippingFee),
      parseNumber(payload.shippingFee, 0),
    );
    var total = parseNumber(
      data && (data.total || data.finalTotal || pricing.total),
      Math.max(0, subtotal - couponDiscount - pointsDiscountValue + shippingFee),
    );

    return {
      subtotal: Math.max(0, subtotal),
      couponDiscount: Math.max(0, couponDiscount),
      pointsDiscount: Math.max(0, pointsDiscountValue),
      shippingFee: Math.max(0, shippingFee),
      total: Math.max(0, total),
      raw: data || {},
    };
  }

  function readCurrentPriceState(subtotal) {
    var shippingFee = 0;
    if (getShippingMethod() === "delivery") {
      shippingFee = subtotal > 0 ? (subtotal >= 200000 ? 0 : 30000) : 0;
      if (typeof isFreeShip !== "undefined" && isFreeShip && subtotal > 0) {
        shippingFee = 0;
      }
    }

    return {
      subtotal: subtotal,
      couponDiscount: typeof currentDiscount !== "undefined" ? parseNumber(currentDiscount, 0) : 0,
      pointsDiscount: typeof pointsDiscount !== "undefined" ? parseNumber(pointsDiscount, 0) : 0,
      shippingFee: shippingFee,
    };
  }

  function applyPreviewToUi(preview) {
    if (typeof currentDiscount !== "undefined") currentDiscount = preview.couponDiscount;
    if (typeof pointsDiscount !== "undefined") pointsDiscount = preview.pointsDiscount;

    lastPreview = preview;
    window.__cldPricePreview = preview;

    var subtotalEl = getElement("subtotalPrice");
    if (subtotalEl) subtotalEl.textContent = formatCurrency(preview.subtotal);

    var shippingEl = getElement("shippingFee");
    if (shippingEl) {
      shippingEl.textContent =
        preview.shippingFee === 0 && preview.subtotal > 0 ? "Mi\u1ec5n ph\u00ed" : formatCurrency(preview.shippingFee);
    }

    var discountRow = getElement("discountRow");
    var discountAmount = getElement("discountAmount");
    if (discountRow && discountAmount) {
      if (preview.couponDiscount > 0) {
        discountRow.style.display = "flex";
        discountAmount.textContent = "- " + formatCurrency(preview.couponDiscount);
      } else {
        discountRow.style.display = "none";
      }
    }

    var pointsRows = [
      { row: getElement("pointsDiscountRow"), amount: getElement("pointsDiscountAmount") },
      { row: getElement("pointsDiscountCalcRow"), amount: getElement("pointsDiscountCalc") },
    ];
    pointsRows.forEach(function (entry) {
      if (!entry.row || !entry.amount) return;
      if (preview.pointsDiscount > 0) {
        entry.row.style.display = "flex";
        entry.amount.textContent = "- " + formatCurrency(preview.pointsDiscount);
      } else {
        entry.row.style.display = "none";
      }
    });

    var grandEl = getElement("grandTotal");
    if (grandEl) grandEl.textContent = formatCurrency(preview.total);

    var sourceEl = getElement("cldPricingSource");
    if (sourceEl) {
      sourceEl.hidden = false;
      sourceEl.textContent = "Gia duoc dong bo tu backend checkout";
    }
  }

  async function requestPricePreview(cart) {
    if (!window.CldApiClient || typeof window.CldApiClient.previewCheckout !== "function") {
      return { ok: false, error: "Checkout API client is not available" };
    }

    setBranchContextByCheckout();
    var branchContext = getCurrentBranchContext();
    var customer = collectCustomerForm();
    var subtotal = getSubtotal(cart);
    var localPrice = readCurrentPriceState(subtotal);
    var couponInput = getElement("couponCode");

    var payload = {
      branchId: branchContext.branchId,
      cityCode: branchContext.cityCode,
      segment: window.CldContext ? window.CldContext.getSegment() : "general",
      shippingMethod: getShippingMethod(),
      paymentMethod: getPaymentMethod(),
      couponCode: couponInput ? couponInput.value.trim().toUpperCase() : "",
      pointsUsed: typeof usedPoints !== "undefined" ? parseNumber(usedPoints, 0) : 0,
      subtotal: localPrice.subtotal,
      couponDiscount: localPrice.couponDiscount,
      pointsDiscount: localPrice.pointsDiscount,
      shippingFee: localPrice.shippingFee,
      customer: customer,
      items: cart.map(function (item) {
        return {
          name: item.name || "",
          quantity: parseNumber(item.quantity, 0),
          unitPrice: parseNumber(item.price, 0),
          size: item.size || "",
          sugar: item.sugar || "",
          ice: item.ice || "",
          toppings: Array.isArray(item.toppings) ? item.toppings.map(function (topping) { return topping.name; }) : [],
          comboItems: Array.isArray(item.comboItems) ? item.comboItems.slice() : [],
        };
      }),
    };

    var result = await window.CldApiClient.previewCheckout(payload);
    if (!result.ok) return { ok: false, error: result.error || "Price preview failed" };

    var preview = normalizePreview(result.data, payload);
    applyPreviewToUi(preview);
    return { ok: true, preview: preview };
  }

  function buildOrderPayload(code, cart, preview) {
    var customer = collectCustomerForm();
    var branchContext = getCurrentBranchContext();
    var engagedCampaigns =
      window.CldTracker && typeof window.CldTracker.getEngagedCampaigns === "function"
        ? window.CldTracker.getEngagedCampaigns()
        : [];

    return {
      orderCode: code,
      branchId: branchContext.branchId,
      cityCode: branchContext.cityCode,
      shippingMethod: getShippingMethod(),
      paymentMethod: getPaymentMethod(),
      segment: window.CldContext ? window.CldContext.getSegment() : "general",
      customer: customer,
      pricing: {
        subtotal: preview.subtotal,
        couponDiscount: preview.couponDiscount,
        pointsDiscount: preview.pointsDiscount,
        shippingFee: preview.shippingFee,
        total: preview.total,
      },
      pointsUsed: typeof usedPoints !== "undefined" ? parseNumber(usedPoints, 0) : 0,
      couponCode: (getElement("couponCode") && getElement("couponCode").value.trim().toUpperCase()) || "",
      items: cart.map(function (item) {
        return {
          name: item.name || "",
          quantity: parseNumber(item.quantity, 0),
          unitPrice: parseNumber(item.price, 0),
          size: item.size || "",
          sugar: item.sugar || "",
          ice: item.ice || "",
          note: item.note || "",
          toppings: Array.isArray(item.toppings) ? item.toppings : [],
          comboItems: Array.isArray(item.comboItems) ? item.comboItems : [],
        };
      }),
      attribution: {
        sessionId: window.CldContext ? window.CldContext.getSessionId() : "",
        campaigns: engagedCampaigns,
      },
      metadata: {
        source: "web-html",
        placedAt: new Date().toISOString(),
      },
    };
  }

  function saveLocalOrder(code, cart, preview) {
    if (
      typeof OrderManager === "undefined" ||
      typeof UserManager === "undefined" ||
      !UserManager.isLoggedIn()
    ) {
      return;
    }

    var customer = collectCustomerForm();
    var productTotal = Math.max(0, preview.subtotal - preview.couponDiscount - preview.pointsDiscount);
    var branchInfo = null;
    if (getShippingMethod() === "dine-in" && typeof selectedBranch !== "undefined" && selectedBranch) {
      branchInfo = {
        name: selectedBranch.name,
        address: selectedBranch.address,
      };
    }

    OrderManager.saveOrder({
      code: code,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      items: cart.map(function (item) {
        return {
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          sugar: item.sugar || "",
          ice: item.ice || "",
          toppings: item.toppings || [],
          note: item.note || "",
          comboItems: item.comboItems || [],
        };
      }),
      total: preview.total,
      subtotal: preview.subtotal,
      couponDiscount: preview.couponDiscount,
      pointsUsed: typeof usedPoints !== "undefined" ? parseNumber(usedPoints, 0) : 0,
      pointsDiscount: preview.pointsDiscount,
      payment:
        getPaymentMethod() === "banking"
          ? "Chuyen khoan"
          : "Thanh toan khi nhan hang",
      shipping: getShippingMethod() === "delivery" ? "Giao hang" : "Uong tai quan",
      branch: branchInfo,
    });

    if (typeof PointsManager !== "undefined") {
      if (typeof usedPoints !== "undefined" && parseNumber(usedPoints, 0) > 0) {
        PointsManager.usePoints(parseNumber(usedPoints, 0));
      }
      PointsManager.earnPoints(productTotal);
    }
  }

  async function cldPlaceOrder() {
    var cart = getCart();
    if (!Array.isArray(cart) || cart.length === 0) {
      if (typeof showToast === "function") showToast("Gio hang trong, khong the dat hang!");
      return;
    }

    if (typeof validateForm !== "function") {
      if (typeof showToast === "function") showToast("Khong the xac thuc thong tin thanh toan.");
      return;
    }

    var validationResult = validateForm();
    if (!validationResult) return;

    var previewResult = await requestPricePreview(cart);
    if (!previewResult.ok) {
      if (typeof showToast === "function") {
        showToast("Khong the dong bo gia tu he thong. Vui long thu lai.");
      }
      return;
    }

    if (validationResult === "NEED_CONFIRM") {
      if (typeof updateQRCode === "function") updateQRCode();
      var confirmed = await showConfirmPayment();
      if (!confirmed) {
        if (typeof showToast === "function") {
          showToast("Vui long hoan tat thanh toan truoc khi dat hang!");
        }
        return;
      }
    }

    var fallbackCode = "GBR-" + Date.now().toString(36).toUpperCase();
    var orderCodeEl = getElement("orderCode");
    if (orderCodeEl) orderCodeEl.textContent = fallbackCode;

    var orderPayload = buildOrderPayload(fallbackCode, cart, previewResult.preview);
    if (!window.CldApiClient || typeof window.CldApiClient.createOrder !== "function") {
      if (typeof showToast === "function") showToast("Order API is not available.");
      return;
    }

    var orderResult = await window.CldApiClient.createOrder(orderPayload);
    if (!orderResult.ok) {
      if (typeof showToast === "function") {
        showToast("Dat hang that bai. Vui long thu lai.");
      }
      return;
    }

    var finalCode =
      (orderResult.data && (orderResult.data.orderCode || orderResult.data.code)) ||
      fallbackCode;
    if (orderCodeEl) orderCodeEl.textContent = finalCode;

    saveLocalOrder(finalCode, cart, previewResult.preview);

    if (window.CldTracker && typeof window.CldTracker.trackOrderAttribution === "function") {
      await window.CldTracker.trackOrderAttribution({
        orderCode: finalCode,
        total: previewResult.preview.total,
        context: "payment",
        cartSnapshot: window.CldContext ? window.CldContext.getCartSnapshot() : [],
      });
    }

    localStorage.removeItem("giborCart");
    if (typeof updateCartCount === "function") updateCartCount();

    var overlay = getElement("successOverlay");
    if (overlay) overlay.classList.add("show");
  }

  function patchUpdateTotals() {
    if (window.__cldUpdateTotalsPatched) return;
    if (typeof updateTotals !== "function") return;

    var originalUpdateTotals = updateTotals;
    updateTotals = function (subtotal) {
      var result = originalUpdateTotals.apply(this, arguments);
      if (lastPreview && Math.abs(parseNumber(subtotal, 0) - parseNumber(lastPreview.subtotal, 0)) < 1) {
        applyPreviewToUi(lastPreview);
      }
      return result;
    };

    window.__cldUpdateTotalsPatched = true;
  }

  function patchBranchSelection() {
    if (window.__cldBranchPatchApplied) return;

    if (typeof window.selectBranch === "function") {
      var originalSelectBranch = window.selectBranch;
      window.selectBranch = function (branchId, city) {
        var result = originalSelectBranch.apply(this, arguments);
        if (window.CldContext) {
          window.CldContext.setBranchContextByBranch(branchId, city, "checkout");
        }
        return result;
      };
    }

    window.__cldBranchPatchApplied = true;
  }

  function rebindPlaceOrderButton() {
    var oldButton = getElement("btnPlaceOrder");
    if (!oldButton || !oldButton.parentNode) return;

    var newButton = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton, oldButton);
    newButton.addEventListener("click", cldPlaceOrder);
  }

  function bindContextListeners() {
    var citySelect = getElement("ckCity");
    if (citySelect) {
      citySelect.addEventListener("change", function () {
        if (!window.CldContext || !citySelect.value) return;
        window.CldContext.setBranchContextByCity(citySelect.value, "checkout");
      });
    }

    var shippingOptions = document.querySelectorAll(".shipping-option");
    shippingOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        setBranchContextByCheckout();
      });
    });
  }

  function init() {
    if (!document.querySelector(".checkout-container")) return;
    patchBranchSelection();
    bindContextListeners();
    rebindPlaceOrderButton();
    setBranchContextByCheckout();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
