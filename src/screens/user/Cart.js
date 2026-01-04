// src/screens/Cart.js
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import QuantitySelector from "../../components/ui/QuantitySelector";
import RadioGroup from "../../components/ui/RadioGroup";
import Card from "../../components/ui/Card";
import { IMAGES } from "../../const/imageConst";
import { addToCart, removeFromCart } from "../../services/cartService";
import Toast from "react-native-toast-message";
import { placeOrder } from "../../services/placeOrder";
import CartEmptySvg from "../../../assets/cart_empty.svg";
import { cacheGet, cacheSet, cacheClear } from "../../services/cache";
import { fetchProductWithAttributes } from "../../services/adminApi";

// Theme tokens (use your theme module)
import { colors, spacing, textSizes, fontWeights, radii } from "../../theme";

export default function Cart() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment method state (wired to RadioGroup)
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (user) {
      loadCart();
      loadDefaultAddress();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) loadCart();
    }, [user])
  );

  // -----------------------------
  // Load Cart (with cache)
  // -----------------------------
  async function loadCart() {
    setLoading(true);
    const cartKey = user ? `cart:${user.id}` : null;
    // Use cache for fast initial render
    if (cartKey) {
      const cached = cacheGet(cartKey);
      if (cached) {
        setCartItems(cached);
        // Do not return here — always reconcile with DB
      }
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity
      `
      )
      .eq("user_id", user.id);

    const raw = error ? [] : data || [];

    // Fetch products for these product_ids
    const productIds = Array.from(
      new Set(raw.map((i) => i.product_id).filter(Boolean))
    );

    // Attempt to fetch product info via store_inventory (includes related products) — more likely to be readable under RLS
    let prodMap = {};
    let invWithProdRows = null;
    let productsRows = null;
    try {
      if (productIds.length) {
        const invRes = await supabase
          .from("store_inventory")
          .select(
            "product_id, stock_value, products(id, name, price, mrp, image_url, short_desc)"
          )
          .in("product_id", productIds);
        invWithProdRows = invRes.data || null;
        (invWithProdRows || []).forEach((r) => {
          if (r?.products) prodMap[r.product_id] = r.products;
        });
      }
    } catch (e) {
      // store the error in debug
      invWithProdRows = { error: String(e) };
    }

    // For any remaining productIds not found via inventory relation, fetch directly from products
    const stillMissing = productIds.filter((id) => !prodMap[id]);
    if (stillMissing.length) {
      try {
        const prodRes = await supabase
          .from("products")
          .select("id, name, price, mrp, image_url, short_desc")
          .in("id", stillMissing);
        productsRows = prodRes.data || null;
        (productsRows || []).forEach((p) => (prodMap[p.id] = p));
      } catch (e) {
        productsRows = { error: String(e) };
      }
    }

    // Merge products into cart rows (allow null products; we'll render fallbacks)
    let list = raw.map((i) => ({
      ...i,
      products: prodMap[i.product_id] || null,
    }));

    // Fetch inventory for these product_ids (ensure we still have inventory mapping)
    let invMap = {};
    if (productIds.length) {
      const { data: invRows } = await supabase
        .from("store_inventory")
        .select("product_id, stock_value")
        .in("product_id", productIds);
      (invRows || []).forEach((r) => (invMap[r.product_id] = r.stock_value));
    }

    // Attach _stock_value to each cart item and normalize prices
    const withInv = list.map((i) => ({
      ...i,
      _stock_value: invMap[i.product_id] ?? 0,
      products: i.products
        ? {
            ...i.products,
            price: Number(i.products.price) || 0,
            mrp:
              typeof i.products.mrp === "number"
                ? i.products.mrp
                : Number(i.products.mrp) || Number(i.products.price) || 0,
          }
        : null,
    }));

    setCartItems(withInv);
    if (cartKey) cacheSet(cartKey, withInv, 5 * 60 * 1000);
    setLoading(false);

    // If some cart rows lack product details, try to fetch them individually in background
    const itemsMissingProduct = withInv
      .filter((it) => !it.products)
      .map((it) => it.product_id);
    if (itemsMissingProduct.length) {
      for (const pid of itemsMissingProduct) {
        try {
          // First try adminApi helper (fetchProductWithAttributes)
          const { data, error } = await fetchProductWithAttributes(pid);
          const prod = data?.product || null;
          if (prod) {
            // merge into state
            setCartItems((prev) =>
              prev.map((it) =>
                it.product_id === pid
                  ? {
                      ...it,
                      products: {
                        ...prod,
                        price: Number(prod.price) || 0,
                        mrp: Number(prod.mrp) || Number(prod.price) || 0,
                      },
                    }
                  : it
              )
            );
            if (cartKey) {
              const updated = (cacheGet(cartKey) || []).map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              );
              cacheSet(cartKey, updated, 5 * 60 * 1000);
            }
            continue;
          }
        } catch (e) {
          // ignore and fallback
        }

        try {
          // Fallback: direct products table fetch
          const { data: prodRow } = await supabase
            .from("products")
            .select("id, name, price, mrp, image_url, short_desc")
            .eq("id", pid)
            .maybeSingle();
          if (prodRow) {
            const prod = {
              ...prodRow,
              price: Number(prodRow.price) || 0,
              mrp: Number(prodRow.mrp) || Number(prodRow.price) || 0,
            };
            setCartItems((prev) =>
              prev.map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              )
            );
            if (cartKey) {
              const updated = (cacheGet(cartKey) || []).map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              );
              cacheSet(cartKey, updated, 5 * 60 * 1000);
            }
            continue;
          }
        } catch (e) {}

        // If still not found, leave as-is; debug will show missing ids
      }
    }
  }

  // -----------------------------
  // Load Default Address (with cache)
  // -----------------------------
  async function loadDefaultAddress() {
    const addrKey = user ? `defaultAddress:${user.id}` : null;
    if (addrKey) {
      const cached = cacheGet(addrKey);
      if (cached) {
        setDefaultAddress(cached);
        return;
      }
    }

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1);

    const addr = data?.[0] || null;
    setDefaultAddress(addr);
    if (addrKey) cacheSet(addrKey, addr, 5 * 60 * 1000);
  }

  // -----------------------------
  // Add / Remove with cache invalidation (optimistic, no loader)
  // -----------------------------
  async function onIncrease(productId) {
    if (!user) return;
    // Optimistic update locally
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.product_id === productId);
      if (idx === -1) {
        // add a new line with minimal product info (will be refreshed later)
        const newItem = {
          id: `tmp-${productId}`,
          product_id: productId,
          quantity: 1,
          products: null,
          _stock_value: 0,
        };
        const next = [newItem, ...prev];
        if (user?.id) cacheSet(`cart:${user.id}`, next, 5 * 60 * 1000);
        return next;
      }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 0) + 1 };
      if (user?.id) cacheSet(`cart:${user.id}`, copy, 5 * 60 * 1000);
      return copy;
    });

    // Fire-and-forget DB update, then reconcile cache/state in background
    try {
      await addToCart(productId, user.id);
    } catch (e) {
      // on error, refresh from DB
      await loadCart();
      return;
    }
  }

  async function onDecrease(productId) {
    if (!user) return;
    // Optimistic update locally
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.product_id === productId);
      if (idx === -1) return prev;
      const copy = [...prev];
      const current = copy[idx].quantity || 0;
      if (current <= 1) {
        copy.splice(idx, 1);
      } else {
        copy[idx] = { ...copy[idx], quantity: current - 1 };
      }
      if (user?.id) cacheSet(`cart:${user.id}`, copy, 5 * 60 * 1000);
      return copy;
    });

    // Fire-and-forget DB update
    try {
      await removeFromCart(productId, user.id);
    } catch (e) {
      await loadCart();
      return;
    }
  }

  // -----------------------------
  // Billing Calculations
  // -----------------------------
  const calculateMRP = () =>
    cartItems.reduce(
      (sum, i) =>
        sum +
        i.quantity *
          (Number(i.products?.mrp) || Number(i.products?.price) || 0),
      0
    );

  const calculateTotal = () =>
    cartItems.reduce(
      (sum, i) => sum + i.quantity * (Number(i.products?.price) || 0),
      0
    );

  const calculateSavings = () => calculateMRP() - calculateTotal();

  const grandTotal = calculateTotal();

  // -----------------------------
  // EMPTY CART UI
  // -----------------------------
  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: spacing.xl,
          backgroundColor: colors.screenBG,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textMuted }}>
          Loading cart...
        </Text>
      </View>
    );

  if (!loading && cartItems.length === 0)
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.screenBG }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.lg,
        }}
      >
        <CartEmptySvg width={160} height={160} />
        <Text
          style={{
            fontSize: textSizes.lg,
            color: colors.textPrimary,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
            fontWeight: fontWeights.bold,
            textAlign: "center",
          }}
        >
          Your cart is empty
        </Text>
        <Text
          style={{
            fontSize: textSizes.md,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.md,
          }}
        >
          Browse products and add items to your cart.
        </Text>
        <Button
          size="sm"
          onPress={() =>
            navigation.navigate("UserTabs", { screen: "Categories" })
          }
        >
          Browse Categories
        </Button>
      </ScrollView>
    );

  // -----------------------------
  // Place Order (clear cart cache and orders cache)
  // -----------------------------
  async function handleOrder() {
    try {
      if (!defaultAddress) {
        Toast.show({
          type: "error",
          text1: "Address Missing",
          text2: "Please add a delivery address first.",
        });
        return;
      }

      const { data: pin } = await supabase
        .from("serviceable_pincodes")
        .select("*")
        .eq("pincode", defaultAddress.pincode)
        .maybeSingle();

      if (!pin) {
        Toast.show({
          type: "error",
          text1: "Not Deliverable",
          text2: "This area is not serviceable.",
        });
        return;
      }

      // If somehow user managed to select an unavailable payment method,
      // guard against it here.
      if (paymentMethod === "online") {
        Toast.show({
          type: "error",
          text1: "Payment Unavailable",
          text2: "Online payment is currently unavailable. Please choose COD.",
        });
        return;
      }

      const orderId = await placeOrder(user, defaultAddress.id, paymentMethod);

      // Clear the cart in DB after successful order
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // Invalidate caches after successful order
      cacheClear(user ? `cart:${user.id}` : undefined);
      cacheClear(user ? `orders:${user.id}` : undefined);

      // Reset local state
      setCartItems([]);

      // Navigate to success screen (no header/footer)
      navigation.navigate("OrderSuccess", {
        orderId,
        address: defaultAddress,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Stay on Cart and show error toast for 5 seconds
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: error.message,
        visibilityTime: 5000,
      });
      // Do not navigate away on failure
    }
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.screenBG }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Debug removed */}

      {/* CARD 1: ADDRESS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Delivery Address
      </Text>
      <Card
        style={{
          marginBottom: spacing.lg,
          backgroundColor: colors.cardBG,
          borderColor: colors.border,
        }}
      >
        {!defaultAddress ? (
          <Button onPress={() => navigation.navigate("AddAddress")}>
            + Add Address
          </Button>
        ) : (
          <View>
            <Text style={[styles.addressLabel, { color: colors.textPrimary }]}>
              {defaultAddress.label}
            </Text>
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
              {defaultAddress.address_line}
            </Text>
            <Text style={[styles.phone, { color: colors.textSecondary }]}>
              📞 {defaultAddress.phone}
            </Text>

            <Button
              variant="secondary"
              onPress={() => navigation.navigate("ManageAddresses")}
              style={{ marginTop: spacing.sm }}
            >
              Change Address
            </Button>
          </View>
        )}
      </Card>

      {/* CARD 2: YOUR ITEMS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Your Items
      </Text>
      <Card
        style={{
          marginBottom: spacing.lg,
          backgroundColor: colors.cardBG,
          borderColor: colors.border,
        }}
      >
        {cartItems.map((i) => {
          const p = i.products || {};
          const price = typeof p.price === "number" ? p.price : 0;
          const mrp = typeof p.mrp === "number" ? p.mrp : price;
          const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
          const isValidImage = (p.image_url || "").startsWith("http");
          const name = p.name || `Product #${i.product_id}`;

          return (
            <View
              key={i.id}
              style={[
                styles.cartItem,
                { backgroundColor: "transparent", borderColor: "transparent" },
              ]}
            >
              {/* Image */}
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetails", { product: p })
                }
              >
                <Image
                  source={isValidImage ? { uri: p.image_url } : IMAGES.default}
                  style={styles.cartImage}
                />
              </Pressable>

              {/* ITEM INFO */}
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.itemName, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {name}
                </Text>

                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.itemPriceDiscount,
                      { color: colors.textPrimary },
                    ]}
                  >
                    ₹{price}
                  </Text>
                  <Text
                    style={[styles.itemMRP, { color: colors.textSecondary }]}
                  >
                    ₹{mrp}
                  </Text>
                  <Text style={[styles.itemOff, { color: colors.success }]}>
                    {discount}% OFF
                  </Text>
                </View>

                {/* Quantity Using NEW COMPONENT */}
                <QuantitySelector
                  value={i.quantity}
                  variant="default"
                  mode="filled"
                  size="sm"
                  onIncrease={() => onIncrease(i.product_id)}
                  onDecrease={() => onDecrease(i.product_id)}
                  disableIncrease={i.quantity >= (i._stock_value ?? 0)}
                  style={{ marginTop: spacing.sm }}
                />

                {/* Move to wishlist */}
                <Pressable
                  onPress={async () => {
                    await supabase.from("wishlist").insert({
                      user_id: user.id,
                      product_id: i.product_id,
                    });
                    await supabase
                      .from("cart_items")
                      .delete()
                      .eq("user_id", user.id)
                      .eq("product_id", i.product_id);
                    cacheClear(user ? `cart:${user.id}` : undefined);
                    cacheClear(user ? `wishlist:${user.id}` : undefined);
                    loadCart();
                  }}
                >
                  <Text
                    style={[styles.wishlistText, { color: colors.primary }]}
                  >
                    ❤️ Move to Wishlist
                  </Text>
                </Pressable>
              </View>

              {/* Total Amount */}
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                ₹{(i.quantity * price).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </Card>

      {/* CARD 3: PAYMENT OPTIONS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Payment Options
      </Text>
      <Card
        style={{
          marginBottom: spacing.lg,
          backgroundColor: colors.cardBG,
          borderColor: colors.border,
        }}
      >
        <RadioGroup
          value={paymentMethod}
          onChange={(val) => setPaymentMethod(val)}
          options={[
            { value: "cod", label: "Cash on Delivery (COD)", disabled: false },
            {
              value: "online",
              label: "Online Payment",
              disabled: true,
              note: "Unavailable",
            },
          ]}
          direction="column"
          size="md"
        />

        <Text
          style={[
            styles.payNote,
            { color: colors.textSecondary, marginTop: spacing.sm },
          ]}
        >
          Online payment is currently unavailable.
        </Text>
      </Card>

      {/* CARD 4: BILL DETAILS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Bill Details
      </Text>
      <Card
        style={{
          marginBottom: spacing.lg,
          backgroundColor: colors.cardBG,
          borderColor: colors.border,
        }}
      >
        <Text style={[styles.billTitle, { color: colors.textPrimary }]}>
          Bill Details
        </Text>

        <BillRow label="Total MRP" value={`₹${calculateMRP()}`} />
        <BillRow
          label="You Saved"
          value={`-₹${calculateSavings()}`}
          highlight
        />
        <BillRow label="Delivery Charge" value="₹0" />
        <BillRow label="Handling Charge" value="₹0" />
        <BillRow label="Grand Total" value={`₹${grandTotal}`} bold />
      </Card>

      {/* PLACE ORDER */}
      <Button block onPress={handleOrder} style={{ marginTop: spacing.sm }}>
        Place Order
      </Button>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

// =====================================================
// BILL ROW SUBCOMPONENT
// =====================================================
function BillRow({ label, value, highlight, bold }) {
  return (
    <View style={styles.billRow}>
      <Text
        style={[
          styles.billLabel,
          bold && { fontWeight: fontWeights.bold, color: colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.billValue,
          highlight && { color: colors.success },
          bold && { fontWeight: fontWeights.bold, color: colors.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenBG },

  sectionTitle: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  addressBox: {
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  addressLabel: { fontSize: textSizes.md, fontWeight: fontWeights.semibold },
  addressLine: { marginVertical: spacing.xs },
  phone: { marginTop: spacing.xs },

  cartItem: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 0,
    marginBottom: spacing.md,
    alignItems: "center",
    backgroundColor: "transparent",
  },

  cartImage: {
    width: 70,
    height: 70,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },

  itemName: { fontSize: textSizes.md, fontWeight: fontWeights.semibold },

  priceRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.xs,
    alignItems: "center",
  },

  itemPriceDiscount: { fontSize: textSizes.md, fontWeight: fontWeights.bold },
  itemMRP: {
    fontSize: textSizes.sm,
    textDecorationLine: "line-through",
  },
  itemOff: { fontSize: textSizes.sm, fontWeight: fontWeights.semibold },

  wishlistText: { marginTop: spacing.xs, fontSize: textSizes.sm },

  itemTotal: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.bold,
    marginLeft: spacing.md,
  },

  paymentBox: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  paymentLabel: { fontSize: textSizes.md, fontWeight: fontWeights.semibold },
  paymentSelected: { fontSize: textSizes.md, fontWeight: fontWeights.bold },
  paymentDisabled: { fontSize: textSizes.sm },

  payNote: {
    fontSize: textSizes.sm,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },

  billBox: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },

  billTitle: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },

  billLabel: { fontSize: textSizes.md },
  billValue: { fontSize: textSizes.md },

  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: { fontSize: textSizes.lg, marginBottom: spacing.md },
});
