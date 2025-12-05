import { useEffect, useState } from "react";
import { placeOrder } from "../../api/placeOrder";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../../const/imageConst";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function CartView({ user }) {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCart();
      loadDefaultAddress();
    }
  }, []);

  const loadCart = async () => {
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, products(name, price, image_url)")
      .eq("user_id", user.id);

    setCartItems(data || []);
  };

  const loadDefaultAddress = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) console.error("Address load error:", error);

    setDefaultAddress(data?.[0] || null);
    setLoading(false);
  };

  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.products.price,
    0
  );

  const handleOrder = async () => {
    if (!defaultAddress) {
      toast.error("Please add an address before placing your order.");
      return;
    }

    const { data: pin } = await supabase
      .from("serviceable_pincodes")
      .select("*")
      .eq("pincode", defaultAddress.pincode)
      .maybeSingle();

    if (!pin) {
      toast.error("Sorry, we cannot deliver to this address.");
      return;
    }

    const orderId = await placeOrder(user, defaultAddress.id, payment);

    toast.success("Order placed! ID: " + orderId);
    navigate("/orders");
  };

  if (!cartItems.length)
    return (
      <div className="p-6 text-center">
        <p className="text-text-primary text-lg font-medium">
          Your cart is empty.
        </p>
        <Button onClick={() => navigate("/shop")} className="m-4">
          Browse Categories
        </Button>
      </div>
    );

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Delivery Address */}
      <h2 className="text-lg font-semibold text-text-primary">
        Delivery Address
      </h2>

      {!defaultAddress ? (
        <Button onClick={() => navigate("/add-address")}>+ Add Address</Button>
      ) : (
        <div className="p-4 bg-white border border-border rounded-2xl shadow-card space-y-1">
          <p className="font-semibold capitalize text-text-primary">
            {defaultAddress.label}
          </p>
          <p className="text-text-primary">{defaultAddress.address_line}</p>
          <p className="text-text-muted">📞 {defaultAddress.phone}</p>

          <Button
            onClick={() => navigate("/manage-addresses")}
            size="small"
            variant="secondary"
          >
            Change Address
          </Button>
        </div>
      )}

      {/* Order Summary */}
      <h2 className="text-lg font-semibold text-text-primary">Order Summary</h2>

      <div className="space-y-4">
        {cartItems.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl shadow-card"
          >
            <img
              src={i.products.image_url || IMAGES.default}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-text-primary font-medium">{i.products.name}</p>
              <p className="text-text-muted text-sm">
                ₹{i.products.price} × {i.quantity}
              </p>
            </div>
            <span className="font-semibold text-text-primary">
              ₹{i.products.price * i.quantity}
            </span>
          </div>
        ))}
      </div>

      <div className="text-right text-xl font-bold text-text-primary">
        Total: ₹{total}
      </div>

      {/* Payment */}
      <div className="border border-border p-4 bg-white rounded-2xl shadow-card space-y-4">
        <h3 className="font-semibold text-text-primary">Payment Method</h3>

        <label className="flex gap-3 items-center text-text-primary">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
          />
          Cash on Delivery
        </label>

        <label className="flex gap-3 items-center text-text-primary">
          <input
            type="radio"
            name="payment"
            value="online"
            checked={payment === "online"}
            onChange={() => setPayment("online")}
          />
          Online Payment
        </label>
      </div>

      {/* Checkout Button */}
      <Button onClick={handleOrder} block>
        Place Order
      </Button>
    </div>
  );
}
