// src/screens/Cart.js
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import QuantitySelector from "../../components/ui/QuantitySelector";
import { IMAGES } from "../../const/imageConst";
import { addToCart, removeFromCart } from "../../services/cartService";
import Toast from "react-native-toast-message";
import { placeOrder } from "../../services/placeOrder";

// Theme tokens (use your theme module)
import { colors, spacing, textSizes, fontWeights, radii } from "../../theme";

export default function Cart() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

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
  // Load Cart
  // -----------------------------
  async function loadCart() {
    const { data } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        products (
          id, name, price, mrp, image_url, short_desc, description
        )
      `
      )
      .eq("user_id", user.id);

    setCartItems(data || []);
    setLoading(false);
  }

  // -----------------------------
  // Load Default Address
  // -----------------------------
  async function loadDefaultAddress() {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1);

    setDefaultAddress(data?.[0] || null);
  }

  // -----------------------------
  // Billing Calculations
  // -----------------------------
  const calculateMRP = () =>
    cartItems.reduce(
      (sum, i) => sum + i.quantity * (i.products.mrp || i.products.price),
      0
    );

  const calculateTotal = () =>
    cartItems.reduce((sum, i) => sum + i.quantity * i.products.price, 0);

  const calculateSavings = () => calculateMRP() - calculateTotal();

  const grandTotal = calculateTotal();

  // -----------------------------
  // EMPTY CART UI
  // -----------------------------
  if (!loading && cartItems.length === 0)
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
          Your cart is empty.
        </Text>
        <Button onPress={() => navigation.navigate("Shop")}>
          Browse Products
        </Button>
      </View>
    );

  // -----------------------------
  // Place Order
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

      const orderId = await placeOrder(user, defaultAddress.id, "cod");

      Toast.show({
        type: "success",
        text1: "Order Placed 🎉",
        text2: `Order ID: ${orderId}`,
      });

      setTimeout(() => navigation.navigate("Orders"), 700);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: error.message,
      });
    }
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* ADDRESS SECTION */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Delivery Address
      </Text>

      {!defaultAddress ? (
        <Button onPress={() => navigation.navigate("AddAddress")}>
          + Add Address
        </Button>
      ) : (
        <View
          style={[
            styles.addressBox,
            { backgroundColor: colors.cardSoft, borderColor: colors.border },
          ]}
        >
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

      {/* CART ITEMS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Your Items
      </Text>

      {cartItems.map((i) => {
        const p = i.products;
        const mrp = p.mrp || p.price;
        const discount = mrp ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
        const isValidImage = p.image_url?.startsWith("http");

        return (
          <View
            key={i.id}
            style={[
              styles.cartItem,
              { backgroundColor: colors.cardSoft, borderColor: colors.border },
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
                {p.name}
              </Text>

              <View style={styles.priceRow}>
                <Text
                  style={[
                    styles.itemPriceDiscount,
                    { color: colors.textPrimary },
                  ]}
                >
                  ₹{p.price}
                </Text>
                <Text style={[styles.itemMRP, { color: colors.textSecondary }]}>
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
                onIncrease={async () => {
                  await addToCart(i.product_id, user.id);
                  loadCart();
                }}
                onDecrease={async () => {
                  await removeFromCart(i.product_id, user.id);
                  loadCart();
                }}
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
                  loadCart();
                }}
              >
                <Text style={[styles.wishlistText, { color: colors.primary }]}>
                  ❤️ Move to Wishlist
                </Text>
              </Pressable>
            </View>

            {/* Total Amount */}
            <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
              ₹{(i.quantity * p.price).toFixed(2)}
            </Text>
          </View>
        );
      })}

      {/* PAYMENT OPTIONS */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Payment Options
      </Text>

      <View
        style={[
          styles.paymentBox,
          { backgroundColor: colors.cardSoft, borderColor: colors.border },
        ]}
      >
        <View style={styles.paymentRow}>
          <Text style={[styles.paymentLabel, { color: colors.textPrimary }]}>
            Cash on Delivery (COD)
          </Text>
          <Text style={[styles.paymentSelected, { color: colors.success }]}>
            ✔
          </Text>
        </View>

        <View style={[styles.paymentRow, { opacity: 0.4 }]}>
          <Text style={[styles.paymentLabel, { color: colors.textPrimary }]}>
            Online Payment
          </Text>
          <Text style={[styles.paymentDisabled, { color: colors.textMuted }]}>
            Unavailable
          </Text>
        </View>

        <Text style={[styles.payNote, { color: colors.textSecondary }]}>
          Online payment is currently unavailable.
        </Text>
      </View>

      {/* BILLING */}
      <View
        style={[
          styles.billBox,
          { backgroundColor: colors.cardSoft, borderColor: colors.border },
        ]}
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
      </View>

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
  container: { padding: spacing.lg, backgroundColor: colors.background },

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
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: "center",
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
