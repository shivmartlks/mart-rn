import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes } from "../../theme";
import { useNavigation } from "@react-navigation/native";

export default function Inventory() {
  const navigation = useNavigation();
  const { storeId, loading: storeLoading } = useActiveStore();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) loadInventory();
  }, [storeId]);

  async function loadInventory() {
    setLoading(true);

    const { data, error } = await supabase
      .from("store_inventory")
      .select(
        `
        stock_value,
        products (
          id,
          name,
          price,
          mrp,
          user_visibility
        )
      `
      )
      .eq("store_id", storeId)
      .order("name", { foreignTable: "products", ascending: true });

    if (error) {
      Alert.alert("Error", "Failed to load inventory");
      setLoading(false);
      return;
    }

    const list = (data || []).map((r) => ({
      id: r.products.id,
      name: r.products.name,
      price: r.products.price,
      mrp: r.products.mrp,
      user_visibility: r.products.user_visibility,
      stock_value: r.stock_value,
    }));

    setRows(list);
    setLoading(false);
  }

  if (storeLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  function renderRow(p) {
    return (
      <View
        key={p.id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={{ color: colors.textPrimary, fontSize: textSizes.sm }}>
            {p.name}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: textSizes.xs,
              marginTop: 2,
            }}
          >
            ₹{p.price} / MRP ₹{p.mrp} • Stock: {p.stock_value}
          </Text>
        </View>

        <View style={{ flexDirection: "row", columnGap: spacing.xs }}>
          <Button
            size="sm"
            variant="secondary"
            onPress={() =>
              navigation.navigate("AdminForm", {
                type: "inventory",
                mode: "view",
                productId: p.id,
              })
            }
          >
            View
          </Button>
          <Button
            size="sm"
            onPress={() =>
              navigation.navigate("AdminForm", {
                type: "inventory",
                mode: "edit",
                productId: p.id,
              })
            }
          >
            Edit
          </Button>
        </View>
      </View>
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
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: spacing.sm }}
            />
          ) : rows.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No products found.
              </Text>
            </View>
          ) : (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: spacing.xs,
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ flex: 1, color: colors.textSecondary }}>
                  Product
                </Text>
                <Text
                  style={{
                    width: 160,
                    textAlign: "right",
                    color: colors.textSecondary,
                  }}
                >
                  Actions
                </Text>
              </View>

              {rows.map(renderRow)}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
