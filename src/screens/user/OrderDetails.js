import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Card from "../../components/ui/Card";
import Divider from "../../components/ui/Divider";
import Badge from "../../components/ui/Badge";
import { getStatusVariant } from "../../utils/orderUtils";
import { cacheGet, cacheSet } from "../../services/cache";

export default function OrderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const cacheKey = id ? `order:${id}` : null;

  useEffect(() => {
    loadOrder();
  }, [id]);

  useEffect(() => {
    if (isFocused) loadOrder();
  }, [isFocused]);

  async function loadOrder() {
    if (cacheKey) {
      const cached = cacheGet(cacheKey);
      if (cached) {
        setOrder(cached);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error) {
      setOrder(data);
      if (cacheKey) cacheSet(cacheKey, data, 2 * 60 * 1000);
    }
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
      style={{ flex: 1, backgroundColor: colors.screenBG }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Top Summary Card, themed like Orders list */}
      <View
        style={{
          backgroundColor: colors.cardBG,
          padding: spacing.md,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: textSizes.md,
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
            }}
          >
            ₹{order.total_amount}
          </Text>
          <Badge
            label={order.status}
            variant={getStatusVariant(order.status)}
            size="md"
          />
        </View>
        <Text
          style={{
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: textSizes.sm,
          }}
        >
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </Text>
        {order.expected_delivery && (
          <Text
            style={{
              marginTop: spacing.xs,
              color: colors.textSecondary,
              fontSize: textSizes.sm,
            }}
          >
            ETA: {new Date(order.expected_delivery).toLocaleDateString()}
          </Text>
        )}
      </View>

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
