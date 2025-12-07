import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading orders...</Text>
      </View>
    );

  if (!orders.length)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#777" }}>
          You haven't placed any orders yet.
        </Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      {orders.map((order) => (
        <Pressable
          key={order.id}
          style={styles.orderCard}
          onPress={() => navigation.navigate("OrderDetails", { id: order.id })}
        >
          {/* Amount + Status */}
          <View style={styles.rowBetween}>
            <Text style={styles.amount}>₹{order.total_amount}</Text>

            <View style={[styles.statusBadge, statusColor(order.status)]}>
              <Text style={[styles.statusText, statusTextColor(order.status)]}>
                {order.status}
              </Text>
            </View>
          </View>

          {/* Placed date */}
          <Text style={styles.date}>
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </Text>

          {/* View Details */}
          <Text style={styles.viewMore}>View Details →</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// 🔥 STATUS COLOR HELPERS
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

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  orderCard: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
  },

  statusBadge: {
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

  viewMore: {
    marginTop: 6,
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },

  center: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
  },
});
