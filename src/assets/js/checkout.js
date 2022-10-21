var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// This is your test publishable API key.
var stripe = Stripe("pk_test_51LhYhHL4uVudLiXA5WwSojoMtx6m0rOM7fufOkPllausovqA0BhBJ0Id0ROuRb336IVLZMjshamhIIOlT1hFOAAS00zH00KnIN");
// The items the customer wants to buy
var items = [{ id: "xl-tshirt" }];
var elements;
checkStatus();
document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);
// Fetches a payment intent and captures the client secret
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var response, clientSecret, appearance, paymentElement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/payment/create-payment-intent", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items: items }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    clientSecret = (_a.sent()).clientSecret;
                    appearance = {
                        theme: 'stripe',
                    };
                    elements = stripe.elements({ appearance: appearance, clientSecret: clientSecret });
                    paymentElement = elements.create("payment");
                    paymentElement.mount("#payment-element");
                    return [2 /*return*/];
            }
        });
    });
}
function handleSubmit(e) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    return [4 /*yield*/, stripe.confirmPayment({
                            elements: elements,
                            confirmParams: {
                                // Make sure to change this to your payment completion page
                                return_url: "http://localhost:4200/not-found",
                            },
                        })];
                case 1:
                    error = (_a.sent()).error;
                    // This point will only be reached if there is an immediate error when
                    // confirming the payment. Otherwise, your customer will be redirected to
                    // your `return_url`. For some payment methods like iDEAL, your customer will
                    // be redirected to an intermediate site first to authorize the payment, then
                    // redirected to the `return_url`.
                    if (error.type === "card_error" || error.type === "validation_error") {
                        showMessage(error.message);
                    }
                    else {
                        showMessage("An unexpected error occurred.");
                    }
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    });
}
// Fetches the payment intent status after payment submission
function checkStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var clientSecret, paymentIntent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
                    if (!clientSecret) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, stripe.retrievePaymentIntent(clientSecret)];
                case 1:
                    paymentIntent = (_a.sent()).paymentIntent;
                    switch (paymentIntent.status) {
                        case "succeeded":
                            showMessage("Payment succeeded!");
                            break;
                        case "processing":
                            showMessage("Your payment is processing.");
                            break;
                        case "requires_payment_method":
                            showMessage("Your payment was not successful, please try again.");
                            break;
                        default:
                            showMessage("Something went wrong.");
                            break;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// ------- UI helpers -------
function showMessage(messageText) {
    var messageContainer = document.querySelector("#payment-message");
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;
    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageText.textContent = "";
    }, 4000);
}
// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    }
    else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}
