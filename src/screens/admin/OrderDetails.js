import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import { colors, spacing, textSizes } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateOrderStatus } from "../../services/adminApi";
import { ORDER_STATUSES } from "../../const/orderStatus";
import { getStatusVariant } from "../../utils/orderUtils";

export default function OrderDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ---------------- Load Order ---------------- */

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  async function loadOrder() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      Alert.alert("Order Not Found", "Unable to load this order.");
      navigation.goBack();
      return;
    }

    setOrder(data);
    setSelectedStatus(data.status);
    setRemarks(data.order_remarks || "");
    setLoading(false);
  }

  /* ---------------- Dirty Check ---------------- */

  const isDirty =
    String(selectedStatus) !== String(order?.status) ||
    String(remarks || "") !== String(order?.order_remarks || "");

  /* ---------------- Update Order ---------------- */

  async function handleUpdate() {
    if (!isDirty) return;

    try {
      setSaving(true);

      await updateOrderStatus(id, selectedStatus, remarks);

      // Reload order to sync UI
      await loadOrder();
    } catch (e) {
      Alert.alert("Error", "Failed to update order");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  /* ---------------- UI ---------------- */

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        {/* ---------- Order Header ---------- */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.title}>Order #{order.id.slice(0, 6)}</Text>

          <Badge
            label={order.status}
            variant={getStatusVariant(order.status)}
            size="md"
          />

          <Text style={styles.meta}>
            ₹{order.total_amount} • {order.payment_mode}
          </Text>

          <Text style={styles.meta}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </Card>

        {/* ---------- Status Update ---------- */}
        <Card style={{ marginBottom: spacing.md }}>
          <Select
            label="Status"
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            {ORDER_STATUSES.map((s) => (
              <Select.Option key={s} value={s} label={s} />
            ))}
          </Select>

          <Input
            label="Status Remarks"
            placeholder="e.g. Hold due to surge"
            value={remarks}
            onChangeText={setRemarks}
          />

          <View style={{ alignItems: "flex-end" }}>
            <Button onPress={handleUpdate} loading={saving} disabled={!isDirty}>
              Update Order
            </Button>
          </View>
        </Card>

        {/* ---------- Items ---------- */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Items</Text>

          {(order.items || []).map((item, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: colors.textPrimary }}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </Card>

        {/* ---------- Address ---------- */}
        <Card>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.meta}>{order.address_line}</Text>
          <Text style={styles.meta}>
            {order.pincode} • {order.phone}
          </Text>

          {order.delivery_instructions ? (
            <Text style={styles.meta}>Note: {order.delivery_instructions}</Text>
          ) : null}
        </Card>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} />
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = {
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
  },
  title: {
    fontSize: textSizes.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 4,
    fontSize: textSizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: textSizes.sm,
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
};
