"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { CustomerDetails } from "@/lib/types";

const STATE_OPTIONS = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
].map((s) => ({ value: s, label: s }));

export default function StepShipping({
  values,
  errors,
  onChange,
}: {
  values: CustomerDetails;
  errors: Partial<Record<keyof CustomerDetails, string>>;
  onChange: (field: keyof CustomerDetails, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Input
        label="Full name"
        value={values.name}
        error={errors.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Aarav Sharma"
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(e) => onChange("email", e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Input
        label="Phone"
        type="tel"
        value={values.phone}
        error={errors.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        placeholder="98765 43210"
        autoComplete="tel"
      />
      <Input
        label="Pincode"
        value={values.pincode}
        error={errors.pincode}
        onChange={(e) => onChange("pincode", e.target.value)}
        placeholder="110001"
        autoComplete="postal-code"
        inputMode="numeric"
      />
      <div className="sm:col-span-2">
        <Input
          label="Address"
          value={values.address}
          error={errors.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="House / street / area"
          autoComplete="street-address"
        />
      </div>
      <Input
        label="City"
        value={values.city}
        error={errors.city}
        onChange={(e) => onChange("city", e.target.value)}
        placeholder="New Delhi"
        autoComplete="address-level2"
      />
      <Select
        label="State"
        options={STATE_OPTIONS}
        value={values.state}
        error={errors.state}
        onChange={(e) => onChange("state", e.target.value)}
      />
    </div>
  );
}
