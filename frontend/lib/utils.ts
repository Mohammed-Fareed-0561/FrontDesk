// lib/utils.ts - shared utility helpers

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number | null | undefined, currency = "INR"): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    if (diffHours < 48) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "-";
  }
}

export function initials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncate(text: string | null | undefined, maxLen = 100): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + "...";
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format a date as a relative time string (e.g. "5 min ago", "2 hours ago", "Yesterday").
 * Returns an accessible absolute timestamp as the second element for screen readers.
 */
export function formatRelativeTime(date: string | Date | null | undefined): {
  relative: string;
  absolute: string;
} {
  if (!date) return { relative: "", absolute: "" };
  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    let relative: string;
    if (diffSec < 60) relative = "Just now";
    else if (diffMin < 60) relative = `${diffMin} min ago`;
    else if (diffHr < 24) relative = `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    else if (diffDay === 1) relative = "Yesterday";
    else if (diffWeek < 4) relative = `${diffDay} days ago`;
    else if (diffMonth < 12) relative = `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
    else relative = `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? "s" : ""} ago`;

    const absolute = d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { relative, absolute };
  } catch {
    return { relative: "", absolute: "" };
  }
}
