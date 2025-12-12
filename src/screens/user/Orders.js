import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { fontWeights } from "../../theme";
import { colors, spacing, textSizes } from "../../theme";
import OrdersEmptySvg from "../../../assets/orders_empty.svg";
import Button from "../../components/ui/Button";

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <OrdersEmptySvg width={160} height={160} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>
            Place your first order to see it here.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text style={styles.header}>My Orders</Text>

          {orders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderCard}
              onPress={() =>
                navigation.navigate("OrderDetails", { id: order.id })
              }
            >
              {/* Amount + Status */}
              <View style={styles.rowBetween}>
                <Text style={styles.amount}>₹{order.total_amount}</Text>

                <View style={[styles.statusBadge, statusColor(order.status)]}>
                  <Text
                    style={[styles.statusText, statusTextColor(order.status)]}
                  >
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
      )}

      {/* Sticky Footer CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footerInner}>
          <Button
            block
            onPress={() =>
              navigation.navigate("UserTabs", { screen: "Categories" })
            }
          >
            Browse Categories
          </Button>
        </View>
      </SafeAreaView>
    </View>
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
    fontWeight: fontWeights.medium,
  },

  center: {
    flex: 1,
    paddingTop: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
  },

  wrapper: { flex: 1, backgroundColor: colors.screenBG },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: textSizes.lg,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySub: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  footerSafeArea: {
    backgroundColor: colors.cardBG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBG,
  },
});
