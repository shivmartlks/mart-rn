import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Card from "../../components/ui/Card";
import Divider from "../../components/ui/Divider";

export default function OrderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading order...
        </Text>
      </View>
    );

  if (!order)
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger, fontSize: textSizes.md }}>
          Order not found.
        </Text>
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Back button removed: header already shows back */}

      {/* Amount + Status */}
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.rowBetween}>
          <Text style={styles.amount}>₹{order.total_amount}</Text>
          <View style={[styles.statusChip, statusBg(order.status)]}>
            <Text style={[styles.statusText, statusFg(order.status)]}>
              {String(order.status).toLowerCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          Ordered on {new Date(order.created_at).toLocaleString()}
        </Text>
      </Card>

      {/* Address */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <Text style={styles.addressLine}>{order.address_line}</Text>
        <Text style={styles.muted}>Pincode: {order.pincode}</Text>
        <Text style={styles.muted}>📞 {order.phone}</Text>
        {order.delivery_instructions ? (
          <Text style={styles.note}>Note: {order.delivery_instructions}</Text>
        ) : null}
      </Card>

      {/* Items */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Items</Text>
        <Divider />
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>
              ₹{item.price} × {item.qty}
            </Text>
          </View>
        ))}
      </Card>

      {/* Payment */}
      <Card>
        <Text style={styles.cardTitle}>Payment</Text>
        <Text style={styles.muted}>
          {order.payment_mode?.toUpperCase() || "N/A"}
        </Text>
      </Card>
    </ScrollView>
  );
}

// Theme-based status colors
function statusBg(status) {
  switch (String(status).toLowerCase()) {
    case "delivered":
      return { backgroundColor: colors.green100 };
    case "pending":
      return { backgroundColor: colors.orange100 };
    case "cancelled":
      return { backgroundColor: colors.red100 };
    default:
      return { backgroundColor: colors.softblue100 };
  }
}
function statusFg(status) {
  switch (String(status).toLowerCase()) {
    case "delivered":
      return { color: colors.green700 };
    case "pending":
      return { color: colors.orange700 };
    case "cancelled":
      return { color: colors.red700 };
    default:
      return { color: colors.gray800 };
  }
}

// 🎨 STYLES ------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
  },
  center: {
    flex: 1,
    paddingTop: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: textSizes.xs,
    fontWeight: fontWeights.semibold,
    textTransform: "capitalize",
  },
  date: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: textSizes.sm,
  },
  cardTitle: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addressLine: {
    color: colors.textPrimary,
    fontSize: textSizes.md,
  },
  muted: {
    color: colors.textSecondary,
    marginVertical: 2,
    fontSize: textSizes.sm,
  },
  note: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  itemName: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
  },
  itemQty: {
    color: colors.textSecondary,
    fontSize: textSizes.sm,
  },
});
