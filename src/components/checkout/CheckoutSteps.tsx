"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { buildOrderFromCart, placeOrder } from "@/lib/services/checkout";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CustomerDetails } from "@/lib/types";
import Button from "@/components/ui/Button";
import StepShipping from "./StepShipping";
import StepPayment from "./StepPayment";
import StepReview from "./StepReview";
import AccountModal from "@/components/auth/AccountModal";

const STEPS = ["Shipping", "Payment", "Review"];

const initialCustomer: CustomerDetails = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutSteps() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const { user, refresh, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<CustomerDetails>(initialCustomer);
  const [customerErrors, setCustomerErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});

  const [card, setCard] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
        city: prev.city || user.city || "",
        state: prev.state || user.state || "",
        pincode: prev.pincode || user.pincode || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const handleAuthSuccess = async () => {
    await refresh();
  };

  const isPhone = (v: string) => /^[0-9+\s-]{10,15}$/.test(v.trim());
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isPincode = (v: string) => /^\d{6}$/.test(v.trim());

  const validateShipping = (): boolean => {
    const e: Partial<Record<keyof CustomerDetails, string>> = {};
    if (!customer.name.trim()) e.name = "Please enter your name.";
    if (!isEmail(customer.email)) e.email = "Enter a valid email.";
    if (!isPhone(customer.phone)) e.phone = "Enter a valid phone number.";
    if (!customer.address.trim()) e.address = "Please enter your address.";
    if (!customer.city.trim()) e.city = "Please enter your city.";
    if (!customer.state) e.state = "Select a state.";
    if (!isPincode(customer.pincode)) e.pincode = "Enter a 6-digit pincode.";
    setCustomerErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    const e: Record<string, string> = {};
    if (!card.cardName.trim()) e.cardName = "Enter the name on the card.";
    const digits = card.cardNumber.replace(/\D/g, "");
    if (digits.length < 12) e.cardNumber = "Enter a valid card number.";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) e.expiry = "Use MM/YY.";
    if (!/^\d{3,4}$/.test(card.cvv.trim())) e.cvv = "3–4 digits.";
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const setCustomerField = (field: keyof CustomerDetails, value: string) =>
    setCustomer((prev) => ({ ...prev, [field]: value }));

  const setCardField = (field: string, value: string) => {
    let v = value;
    if (field === "cardNumber") {
      v = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    setCard((prev) => ({ ...prev, [field]: v }));
  };

  const next = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (step === 0 && !validateShipping()) return;
    if (step === 1 && !validatePayment()) return;
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setPlacing(true);
    setError("");
    try {
      if (!items.length) throw new Error("Your cart is empty.");
      const orderDraft = buildOrderFromCart(items, customer, subtotal);
      const order = await placeOrder(orderDraft);
      window.sessionStorage.setItem("ecobrew-last-order", JSON.stringify(order));
      clear();
      router.push("/order-confirmation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong placing your order.");
      setPlacing(false);
    }
  };

  return (
    <div>
      {/* Account requirement banner in checkout */}
      {!user ? (
        <div className="mb-8 rounded-biophilic bg-leaf-deep/5 p-6 ring-1 ring-leaf-deep/20 text-center">
          <h3 className="font-display text-lg font-medium text-leaf-deep">
            Sign in to order
          </h3>
          <p className="mt-1 text-sm text-moss">
            Orders need a free EcoBrew account — your own unique User ID and password.
          </p>
          <div className="mt-4">
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Sign in or create an account
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-white/60 px-5 py-3 shadow-sm border border-moss/15 text-xs text-moss">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sprout" />
            <span>Ordering as <strong className="text-leaf-deep font-semibold">@{user.userId}</strong> ({user.name || user.email})</span>
          </div>
          <button
            onClick={() => {
              signOut();
              setIsAuthModalOpen(true);
            }}
            className="text-leaf-deep underline hover:text-moss"
          >
            Switch Account
          </button>
        </div>
      )}

      {/* Step indicator */}
      <ol className="mb-8 flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? "bg-sprout text-leaf-deep"
                    : i === step
                      ? "bg-leaf-deep text-oat"
                      : "bg-white/60 text-moss"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-leaf-deep" : "text-moss"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-3 h-px flex-1 ${i < step ? "bg-sprout" : "bg-moss/25"}`} />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-biophilic shadow-soft ring-1 ring-leaf-deep/8 bg-white/60 p-6 sm:p-8">
        {step === 0 && (
          <StepShipping values={customer} errors={customerErrors} onChange={setCustomerField} />
        )}
        {step === 1 && (
          <StepPayment
            cardName={card.cardName}
            cardNumber={card.cardNumber}
            expiry={card.expiry}
            cvv={card.cvv}
            errors={cardErrors}
            onChange={setCardField}
          />
        )}
        {step === 2 && <StepReview items={items} subtotal={subtotal} customer={customer} />}

        {error && (
          <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={back}>Back</Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!user}>Continue</Button>
          ) : (
            <Button onClick={handlePlaceOrder} disabled={placing || !user}>
              {placing ? "Placing order…" : "Place order"}
            </Button>
          )}
        </div>
      </div>

      <AccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
