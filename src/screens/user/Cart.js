import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";

export default function Cart() {
  const navigation = useNavigation();
  const { user } = useAuth();

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

  async function loadCart() {
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, products(name, price, image_url)")
      .eq("user_id", user.id);

    setCartItems(data || []);
  }

  async function loadDefaultAddress() {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);

    if (!error) setDefaultAddress(data?.[0] || null);
    setLoading(false);
  }

  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.products.price,
    0
  );

  async function handleOrder() {
    if (!defaultAddress) {
      Alert.alert("Address Missing", "Please add a delivery address.");
      return;
    }

    const { data: pin } = await supabase
      .from("serviceable_pincodes")
      .select("*")
      .eq("pincode", defaultAddress.pincode)
      .maybeSingle();

    if (!pin) {
      Alert.alert("Not Serviceable", "We cannot deliver to this address.");
      return;
    }

    // TODO: convert your placeOrder API into RN version
    Alert.alert(
      "Order Placed! 🎉",
      "Your order has been successfully created."
    );

    navigation.navigate("Orders");
  }

  if (!cartItems.length && !loading)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <Button onPress={() => navigation.navigate("Shop")}>
          Browse Categories
        </Button>
      </View>
    );

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Delivery Address */}
      <Text style={styles.sectionTitle}>Delivery Address</Text>

      {!defaultAddress ? (
        <Button onPress={() => navigation.navigate("AddAddress")}>
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

      {/* Order Summary */}
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {cartItems.map((i) => (
        <View key={i.id} style={styles.cartItem}>
          <Image
            source={{ uri: i.products.image_url }}
            style={styles.cartImage}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{i.products.name}</Text>
            <Text style={styles.itemPrice}>
              ₹{i.products.price} × {i.quantity}
            </Text>
          </View>

          <Text style={styles.itemTotal}>₹{i.products.price * i.quantity}</Text>
        </View>
      ))}

      <Text style={styles.totalAmount}>Total: ₹{total}</Text>

      {/* Payment Method */}
      <View style={styles.paymentBox}>
        <Text style={styles.paymentTitle}>Payment Method</Text>

        {/* COD */}
        <Pressable style={styles.radioRow} onPress={() => setPayment("cod")}>
          <View
            style={[
              styles.radioCircle,
              payment === "cod" && styles.radioActive,
            ]}
          />
          <Text style={styles.paymentOption}>Cash on Delivery</Text>
        </Pressable>

        {/* Online */}
        <Pressable style={styles.radioRow} onPress={() => setPayment("online")}>
          <View
            style={[
              styles.radioCircle,
              payment === "online" && styles.radioActive,
            ]}
          />
          <Text style={styles.paymentOption}>Online Payment</Text>
        </Pressable>
      </View>

      {/* Checkout Button */}
      <Button block onPress={handleOrder} style={{ marginBottom: 40 }}>
        Place Order
      </Button>
    </ScrollView>
  );
}

// ============================
// 🔥 STYLES
// ============================
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },

  addressBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },

  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  addressLine: {
    color: "#444",
    marginVertical: 4,
  },

  phone: {
    color: "#888",
  },

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
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },

  itemPrice: {
    color: "#666",
    fontSize: 13,
  },

  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
  },

  totalAmount: {
    textAlign: "right",
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 10,
  },

  paymentBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 20,
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 10,
  },

  radioActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },

  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    marginBottom: 12,
  },
});
