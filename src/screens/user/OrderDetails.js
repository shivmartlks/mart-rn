import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function OrderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error) setOrder(data);
    setLoading(false);
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading order...</Text>
      </View>
    );

  if (!order)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>Order not found.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order Details</Text>

      {/* Back Button */}
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back to Orders</Text>
      </Pressable>

      {/* Amount + Status */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.amount}>₹{order.total_amount}</Text>

          <View style={[styles.statusChip, statusColor(order.status)]}>
            <Text style={[styles.statusText, statusTextColor(order.status)]}>
              {order.status}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>
          Ordered on {new Date(order.created_at).toLocaleString()}
        </Text>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>

        <Text style={styles.addressLine}>{order.address_line}</Text>
        <Text style={styles.muted}>Pincode: {order.pincode}</Text>
        <Text style={styles.muted}>📞 {order.phone}</Text>

        {order.delivery_instructions ? (
          <Text style={styles.note}>Note: {order.delivery_instructions}</Text>
        ) : null}
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>

        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>
              ₹{item.price} × {item.qty}
            </Text>
          </View>
        ))}
      </View>

      {/* Payment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment</Text>
        <Text style={styles.muted}>
          {order.payment_mode?.toUpperCase() || "N/A"}
        </Text>
      </View>
    </ScrollView>
  );
}



// 🔥 STATUS BADGE COLORS
function statusColor(status) {
  switch (status) {
    case "delivered":
      return { backgroundColor: "#D1FAE5" };
    case "pending":
      return { backgroundColor: "#FFEDD5" };
    case "cancelled":
      return { backgroundColor: "#FEE2E2" };
    default:
      return { backgroundColor: "#DBEAFE" };
  }
}

function statusTextColor(status) {
  switch (status) {
    case "delivered":
      return { color: "#047857" };
    case "pending":
      return { color: "#C2410C" };
    case "cancelled":
      return { color: "#B91C1C" };
    default:
      return { color: "#1D4ED8" };
  }
}



// 🎨 STYLES ------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  backBtn: {
    marginBottom: 14,
  },
  backBtnText: {
    color: "#555",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amount: {
    fontSize: 22,
    fontWeight: "700",
  },

  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  date: {
    marginTop: 6,
    color: "#777",
    fontSize: 13,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  addressLine: {
    color: "#333",
    fontSize: 16,
  },

  muted: {
    color: "#666",
    marginVertical: 2,
  },

  note: {
    marginTop: 5,
    color: "#444",
    fontStyle: "italic",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  itemName: {
    fontSize: 16,
    color: "#222",
  },
  itemQty: {
    color: "#666",
  },
});
