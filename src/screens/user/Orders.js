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
import Badge from "../../components/ui/Badge";
import { getStatusVariant } from "../../utils/orderUtils";

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
        // Centered empty state like Wishlist
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.screenBG }}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
          }}
        >
          <OrdersEmptySvg width={160} height={160} />
          <Text
            style={{
              fontSize: textSizes.lg,
              color: colors.textPrimary,
              marginTop: spacing.md,
              marginBottom: spacing.xs,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            No orders yet
          </Text>
          <Text
            style={{
              fontSize: textSizes.md,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: spacing.md,
            }}
          >
            Place your first order to see it here.
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
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.screenBG }}
          contentContainerStyle={{ padding: spacing.lg }}
        >
          {/* Removed page heading; Header component already shows the title */}
          {orders.map((order) => (
            <Pressable
              key={order.id}
              style={{
                backgroundColor: colors.cardBG,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() =>
                navigation.navigate("OrderDetails", { id: order.id })
              }
            >
              <View style={styles.rowBetween}>
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

              <Text
                style={{
                  marginTop: spacing.xs,
                  color: colors.primary,
                  fontSize: textSizes.sm,
                  fontWeight: fontWeights.medium,
                }}
              >
                View Details →
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    // removed hardcoded padding/bg; using themed styles above
  },

  header: {
    // removed page heading style
  },

  orderCard: {
    // replaced with inline themed styles
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
