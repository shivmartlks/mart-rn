import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";
import { IMAGES } from "../../const/imageConst";
import { addToCart, removeFromCart } from "../../services/cartService";

// =====================================================
// MAIN CART SCREEN
// =====================================================
export default function Cart() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Load cart on mount
  // -------------------------------
  useEffect(() => {
    if (user) {
      loadCart();
      loadDefaultAddress();
    }
  }, [user]);

  // -------------------------------
  // Reload cart when screen focused
  // -------------------------------
  useFocusEffect(
    useCallback(() => {
      if (user) loadCart();
    }, [user])
  );

  // -------------------------------
  // Fetch Cart Items
  // -------------------------------
  async function loadCart() {
    const { data, error } = await supabase
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

    if (!error) setCartItems(data || []);
    setLoading(false);
  }

  // -------------------------------
  // Fetch Default Address
  // -------------------------------
  async function loadDefaultAddress() {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1);

    setDefaultAddress(data?.[0] || null);
  }

  // -------------------------------
  // Billing Calculations
  // -------------------------------
  const calculateMRP = () =>
    cartItems.reduce(
      (sum, i) => sum + i.quantity * (i.products.mrp || i.products.price),
      0
    );

  const calculateTotal = () =>
    cartItems.reduce((sum, i) => sum + i.quantity * i.products.price, 0);

  const calculateSavings = () => calculateMRP() - calculateTotal();

  const grandTotal = calculateTotal();

  // -------------------------------
  // EMPTY CART
  // -------------------------------
  if (!loading && cartItems.length === 0)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <Button onPress={() => navigation.navigate("Shop")}>
          Browse Products
        </Button>
      </View>
    );

  // -------------------------------
  // MAIN UI
  // -------------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>

      {!defaultAddress ? (
        <Button
          onPress={() => navigation.navigate("AddAddress")}
          style={{ marginBottom: 12 }}
        >
          + Add Address
        </Button>
      ) : (
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
          <Text style={styles.addressLine}>{defaultAddress.address_line}</Text>
          <Text style={styles.phone}>📞 {defaultAddress.phone}</Text>

          <Button
            variant="secondary"
            onPress={() => navigation.navigate("ManageAddresses")}
          >
            Change Address
          </Button>
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Items</Text>

      {/* -------------------------------
          CART ITEMS LIST
      ------------------------------- */}
      {cartItems.map((i) => {
        const p = i.products;
        const mrp = p.mrp || p.price;
        const discount = Math.round(((mrp - p.price) / mrp) * 100);

        const isValidImage = p.image_url && p.image_url.startsWith("http");

        return (
          <Pressable
            key={i.id}
            style={styles.cartItem}
            onPress={() =>
              navigation.navigate("ProductDetails", { product: p })
            }
          >
            <Image
              source={isValidImage ? { uri: p.image_url } : IMAGES.default}
              style={styles.cartImage}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{p.name}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.itemPriceDiscount}>₹{p.price}</Text>
                <Text style={styles.itemMRP}>₹{mrp}</Text>
                <Text style={styles.itemOff}>{discount}% OFF</Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={async () => {
                    await removeFromCart(i.product_id, user.id);
                    loadCart();
                  }}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{i.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={async () => {
                    await addToCart(i.product_id, user.id);
                    loadCart();
                  }}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Move to wishlist */}
              <TouchableOpacity
                onPress={async () => {
                  // Add to wishlist
                  await supabase.from("wishlist").insert({
                    user_id: user.id,
                    product_id: i.product_id,
                  });

                  // Remove full row from cart
                  await supabase
                    .from("cart_items")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("product_id", i.product_id);

                  loadCart();
                }}
              >
                <Text style={styles.wishlistText}>❤️ Move to Wishlist</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotal}>
              ₹{(i.quantity * p.price).toFixed(2)}
            </Text>
          </Pressable>
        );
      })}

      {/* -------------------------------
          BILL DETAILS
      ------------------------------- */}
      <View style={styles.billBox}>
        <Text style={styles.billTitle}>Bill Details</Text>

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

      <Button block onPress={() => Alert.alert("Order", "Place Order API")}>
        Place Order
      </Button>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// =====================================================
// BILL ROW COMPONENT
// =====================================================
function BillRow({ label, value, highlight, bold }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && { fontWeight: "700" }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.billValue,
          highlight && { color: "green" },
          bold && { fontWeight: "700" },
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
  container: { padding: 16, backgroundColor: "#F5F5F5" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },

  addressBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20,
  },

  addressLabel: { fontSize: 16, fontWeight: "600" },
  addressLine: { color: "#555", marginVertical: 4 },
  phone: { color: "#777" },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },

  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },

  itemName: { fontSize: 16, fontWeight: "600" },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  itemPriceDiscount: { fontSize: 15, fontWeight: "700" },

  itemMRP: {
    fontSize: 12,
    color: "#777",
    textDecorationLine: "line-through",
  },

  itemOff: { fontSize: 12, color: "green", fontWeight: "600" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qtyText: { fontSize: 16, fontWeight: "700" },

  wishlistText: {
    marginTop: 6,
    color: "#E91E63",
    fontSize: 13,
    fontWeight: "500",
  },

  itemTotal: { fontSize: 16, fontWeight: "700", marginLeft: 10 },

  billBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20,
  },

  billTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  billLabel: { fontSize: 15, color: "#555" },
  billValue: { fontSize: 15, color: "#222" },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: { fontSize: 18, marginBottom: 14 },
});
