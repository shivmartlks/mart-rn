import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) console.error(error);
    setOrder(data);
    setLoading(false);
  };

  if (loading) return <p className="p-5 text-text-primary">Loading order...</p>;
  if (!order) return <p className="p-5 text-text-danger">Order not found.</p>;

  return (
    <div className="max-w-xl mx-auto p-5 space-y-6 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">
        Order Details
      </h2>

      {/* Back Button */}
      <Button link onClick={() => navigate(-1)} variant="secondary">
        ← Back to Orders
      </Button>

      {/* Amount + Status */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-xl text-text-primary">
            ₹{order.total_amount}
          </span>

          {/* STATUS CHIPS */}
          <span
            className={`
              px-3 py-1 text-xs rounded-xl font-medium capitalize
              ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "pending"
                  ? "bg-orange-100 text-orange-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }
            `}
          >
            {order.status}
          </span>
        </div>

        <p className="text-text-muted text-sm">
          Ordered on {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      {/* Address */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-5 space-y-1">
        <h3 className="font-semibold text-lg text-text-primary mb-2">
          Delivery Address
        </h3>

        <p className="text-text-primary">{order.address_line}</p>
        <p className="text-text-muted">Pincode: {order.pincode}</p>
        <p className="text-text-muted">📞 {order.phone}</p>

        {order.delivery_instructions && (
          <p className="text-text-muted mt-1">
            Note: {order.delivery_instructions}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-5">
        <h3 className="font-semibold text-lg text-text-primary mb-3">Items</h3>

        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between py-3 border-b border-border last:border-none"
          >
            <span className="text-text-primary">{item.name}</span>
            <span className="text-text-muted">
              ₹{item.price} × {item.qty}
            </span>
          </div>
        ))}
      </div>

      {/* Payment */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-5">
        <h3 className="font-semibold text-lg text-text-primary">Payment</h3>
        <p className="capitalize text-text-muted">{order.payment_mode}</p>
      </div>
    </div>
  );
}
