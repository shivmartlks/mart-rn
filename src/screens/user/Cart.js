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
          id, name, price, mrp, image_url, short_desc, description, stock_value
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
      style={[styles.container, { backgroundColor: colors.screenBG }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
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
          const p = i.products;
          const mrp = p.mrp || p.price;
          const discount = mrp ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
          const isValidImage = p.image_url?.startsWith("http");

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
                  onIncrease={async () => {
                    await addToCart(i.product_id, user.id);
                    loadCart();
                  }}
                  onDecrease={async () => {
                    await removeFromCart(i.product_id, user.id);
                    loadCart();
                  }}
                  disableIncrease={i.quantity >= p.stock_value} // Disable + button if stock is exceeded
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
                  <Text
                    style={[styles.wishlistText, { color: colors.primary }]}
                  >
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
