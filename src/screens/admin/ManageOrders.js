import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { supabase } from "../../services/supabase";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import Badge from "../../components/ui/Badge";
import { getStatusVariant } from "../../utils/orderUtils";

const PAGE_SIZE = 50;

export default function ManageOrders() {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadOrders(true);
  }, []);

  async function loadOrders(reset = false) {
    if (loadingMore || (!hasMore && !reset)) return;

    reset ? setLoading(true) : setLoadingMore(true);

    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        status,
        created_at,
        user_id
      `
      )
      .not("status", "in", "(delivered,cancelled)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.log("Failed to Load Order");
      Alert.alert("Error", "Failed to load orders");
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const list = data || [];

    setOrders(reset ? list : [...orders, ...list]);
    setHasMore(list.length === PAGE_SIZE);
    setPage(reset ? 1 : page + 1);

    setLoading(false);
    setLoadingMore(false);
  }

  function renderOrder(o) {
    return (
      <Pressable
        key={o.id}
        onPress={() => navigation.navigate("OrderDetails", { id: o.id })}
        style={{
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: textSizes.sm,
              }}
            >
              #{o.id.slice(0, 6)}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: textSizes.xs,
                marginTop: 2,
              }}
            >
              {o.profiles?.name || "Guest"} • ₹{o.total_amount}
            </Text>
          </View>
          <Badge
            label={o.status}
            variant={getStatusVariant(o.status)}
            size="md"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        <Card style={{ padding: spacing.md }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : orders.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No active orders.
              </Text>
            </View>
          ) : (
            <>
              {orders.map(renderOrder)}

              {hasMore && (
                <Button
                  block
                  variant="secondary"
                  loading={loadingMore}
                  style={{ marginTop: spacing.md }}
                  onPress={() => loadOrders(false)}
                >
                  Load More
                </Button>
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
