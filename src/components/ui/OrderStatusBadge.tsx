import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

const TONES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  approved: "bg-sky-100 text-sky-700 ring-sky-200",
  in_transit: "bg-sprout/15 text-sprout-dark ring-sprout/30",
  delivered: "bg-sprout text-white ring-sprout",
  cancelled: "bg-red-100 text-red-600 ring-red-200",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${TONES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
