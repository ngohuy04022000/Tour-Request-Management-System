/**
 * Format số thành tiền VNĐ
 */
export function formatVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ngày dd/MM/yyyy
 */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

/**
 * Label màu cho trạng thái phiếu
 */
export function statusBadge(status) {
  return status === "Chờ duyệt quản lý"
    ? { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-400" }
    : { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
}

/**
 * Label màu cho loại tour
 */
export function tourTypeBadge(type) {
  const map = {
    FIT:  { bg: "bg-blue-100",   text: "text-blue-700"   },
    GIT:  { bg: "bg-purple-100", text: "text-purple-700" },
    MICE: { bg: "bg-orange-100", text: "text-orange-700" },
  };
  return map[type] || { bg: "bg-gray-100", text: "text-gray-700" };
}
