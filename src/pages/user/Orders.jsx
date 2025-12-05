import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setOrders(data || []);
    setLoading(false);
  };

  if (loading)
    return <p className="p-5 text-text-primary">Loading orders...</p>;

  if (!orders.length)
    return (
      <div className="p-5 text-center">
        <p className="text-text-muted">You haven't placed any orders yet.</p>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto p-5 space-y-6 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => navigate(`/orders/${order.id}`)}
          className="
            bg-white 
            border border-border 
            rounded-2xl 
            shadow-card 
            p-5 
            hover:bg-gray-50 
            cursor-pointer 
            transition
            space-y-1
          "
        >
          {/* Amount + Status */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-text-primary text-lg">
              ₹{order.total_amount}
            </span>

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

          {/* Placed on */}
          <p className="text-text-muted text-sm">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>

          {/* View Details */}
          <p className="text-primary text-sm font-medium mt-1">
            View Details →
          </p>
        </div>
      ))}
    </div>
  );
}
