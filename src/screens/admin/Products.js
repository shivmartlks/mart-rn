import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import { fetchProducts } from "../../services/adminApi";
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes } from "../../theme";

export default function Products() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await fetchProducts();
    if (error) Alert.alert("Error", "Failed to fetch products");
    else setProducts(data || []);
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) Alert.alert("Error", "Failed to delete product");
    else loadProducts();
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
            {p.name}{" "}
            <Text style={{ color: colors.textSecondary }}>₹{p.price}</Text>
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            columnGap: spacing.xs,
            alignItems: "center",
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            onPress={() =>
              navigation.navigate("AdminForm", {
                type: "product",
                mode: "view",
                id: p.id,
              })
            }
          >
            View
          </Button>
          <Button
            size="sm"
            onPress={() =>
              navigation.navigate("AdminForm", {
                type: "product",
                mode: "edit",
                id: p.id,
              })
            }
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            textStyle={{ color: colors.danger }}
            style={{ borderColor: colors.danger }}
            onPress={() => setDeleteId(p.id)}
          >
            Delete
          </Button>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        <View style={styles.card}>
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
                width: 220,
                textAlign: "right",
                color: colors.textSecondary,
              }}
            >
              Actions
            </Text>
          </View>
          {products.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No products added yet.
              </Text>
            </View>
          ) : (
            products.map(renderRow)
          )}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: colors.cardBG,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: 8,
          }}
        >
          <Button
            block
            onPress={() =>
              navigation.navigate("AdminForm", {
                type: "product",
                mode: "edit",
              })
            }
          >
            Add Product
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: colors.cardBG,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
});
