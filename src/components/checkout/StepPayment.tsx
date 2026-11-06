"use client";

import Input from "@/components/ui/Input";
import { ShieldIcon } from "@/components/icons";

export default function StepPayment({
  cardName,
  cardNumber,
  expiry,
  cvv,
  errors,
  onChange,
}: {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  errors: { cardName?: string; cardNumber?: string; expiry?: string; cvv?: string };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-sprout/30 bg-sprout/8 p-4">
        <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-sprout-dark" />
        <div>
          <p className="text-sm font-medium text-leaf-deep">Payment</p>
          <p className="text-sm text-moss">
            Payments are processed through our secure checkout. We never see or store your full card number.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Name on card"
            value={cardName}
            error={errors.cardName}
            onChange={(e) => onChange("cardName", e.target.value)}
            placeholder="Aarav Sharma"
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Card number"
            inputMode="numeric"
            value={cardNumber}
            error={errors.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
          />
        </div>
        <Input
          label="Expiry (MM/YY)"
          value={expiry}
          error={errors.expiry}
          onChange={(e) => onChange("expiry", e.target.value)}
          placeholder="12/27"
          maxLength={5}
        />
        <Input
          label="CVV"
          inputMode="numeric"
          type="password"
          value={cvv}
          error={errors.cvv}
          onChange={(e) => onChange("cvv", e.target.value)}
          placeholder="•••"
          maxLength={4}
        />
      </div>
    </div>
  );
}
