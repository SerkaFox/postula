import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";
import { STATUS_STYLES } from "./status-style";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
