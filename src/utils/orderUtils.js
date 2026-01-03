// filepath: src/utils/orderUtils.js

// Map order status to Badge variant
export function getStatusVariant(status) {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "cancelled":
    case "failed":
      return "danger";
    case "hold":
      return "info";
    default:
      return "info";
  }
}
