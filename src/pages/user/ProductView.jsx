import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  addToCart,
  removeFromCart,
  getCartCount,
} from "../../utils/cartService";
import { IMAGES } from "../../const/imageConst";
import toast from "react-hot-toast";

export default function ProductView({ user }) {
  const navigate = useNavigate();
  const { id: subcategoryId } = useParams();

  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subcategoryId) fetchData(subcategoryId);
  }, [subcategoryId]);

  async function fetchData(id) {
    setLoading(true);

    try {
      const { data: grps } = await supabase
        .from("product_groups")
        .select("*")
        .eq("subcategory_id", id)
        .order("name");

      const groupIds = grps.map((g) => g.id);
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .in("group_id", groupIds)
        .order("name");

      setGroups(grps);
      setProducts(prods);
      if (grps?.length) setActiveGroup(grps[0].id);

      if (user) {
        const count = await getCartCount(user.id);
        setCartCount(count);
        await loadCartItems();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCartItems() {
    if (!user) return;

    const { data } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("user_id", user.id);

    const map = {};
    data?.forEach((item) => (map[item.product_id] = item.quantity));

    setCartItems(map);
  }

  async function handleAddToCart(product) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return toast.error("Please log in.");

    const res = await addToCart(product.id, authUser.id);

    if (!res.error) {
      const newQty = (cartItems[product.id] || 0) + 1;

      setCartItems({ ...cartItems, [product.id]: newQty });
      setCartCount((prev) => prev + 1);
    }
  }

  async function handleRemoveFromCart(product) {
    const currentQty = cartItems[product.id] || 0;
    if (currentQty === 0) return;

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return toast.error("Please log in.");

    const res = await removeFromCart(product.id, authUser.id);

    if (!res.error) {
      const newQty = currentQty - 1;
      const updated = { ...cartItems };

      if (newQty > 0) updated[product.id] = newQty;
      else delete updated[product.id];

      setCartItems(updated);
      setCartCount((prev) => Math.max(0, prev - 1));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-text-muted">
        Loading products...
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) => p.group_id === activeGroup && p.is_available
  );

  return (
    <div className="min-h-screen bg-app flex flex-row">
      {/* Sidebar */}
      <aside className="w-[172px] bg-white border-r border-border p-3">
        <div className="flex flex-col gap-3 overflow-y-auto pb-2">
          {groups.map((grp) => (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id)}
              className={`
                text-sm px-3 py-2 rounded-xl transition 
                ${
                  activeGroup === grp.id
                    ? "bg-black-800 text-white shadow-card font-medium"
                    : "bg-gray-100 text-text-primary hover:bg-gray-200"
                }
              `}
            >
              {grp.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {filteredProducts.length === 0 ? (
          <p className="text-text-muted">
            No products available in this group.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((p) => {
              const qty = cartItems[p.id] || 0;

              return (
                <div
                  key={p.id}
                  className="
                    rounded-2xl p-3 
                    bg-white border border-border 
                    shadow-card flex flex-col
                  "
                >
                  {/* Product image */}
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-32 w-full object-cover rounded-xl mb-3 bg-white"
                    />
                  ) : (
                    <div className="h-32 w-full bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                      <img
                        src={IMAGES.default}
                        alt="Default"
                        className="h-20 object-contain"
                      />
                    </div>
                  )}

                  {/* Product title */}
                  <h4 className="text-sm font-semibold text-text-primary leading-tight">
                    {p.name}
                  </h4>

                  {/* Short description */}
                  <p className="text-xs text-text-muted truncate mb-2">
                    {p.short_desc || p.description || "—"}
                  </p>

                  <div className="mt-auto space-y-1">
                    {/* Discount badge */}
                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
                      {(((p.mrp - p.price) / p.mrp) * 100).toFixed(0)}% OFF
                    </span>

                    {/* Price Row */}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        ₹{p.price}
                      </p>
                      <p className="text-sm text-text-muted line-through">
                        ₹{p.mrp}
                      </p>
                    </div>

                    {/* Quantity buttons */}
                    <div className="flex items-center gap-3 mt-2">
                      {/* – */}
                      <button
                        onClick={() => handleRemoveFromCart(p)}
                        disabled={qty === 0}
                        className={`
                          px-3 py-1 rounded-lg text-sm 
                          ${
                            qty > 0
                              ? "bg-gray-200 hover:bg-gray-300 text-text-primary"
                              : "bg-gray-100 text-text-muted cursor-not-allowed"
                          }
                        `}
                      >
                        −
                      </button>

                      <span className="text-text-primary">{qty}</span>

                      {/* + */}
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="
                          bg-black-800 hover:bg-black-900 
                          text-white px-3 py-1 
                          rounded-lg text-sm 
                          active:scale-[0.97] transition
                        "
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div
          onClick={() => navigate("/cart")}
          className="
            fixed bottom-20 right-4 
            bg-black-800 hover:bg-black-900 
            text-white rounded-full shadow-lg 
            px-6 py-3 flex items-center gap-3 cursor-pointer
            active:scale-[0.97] transition-all
          "
        >
          <span className="font-semibold">{cartCount} items</span>
        </div>
      )}
    </div>
  );
}
