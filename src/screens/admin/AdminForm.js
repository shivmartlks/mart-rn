import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { colors, spacing } from "../../theme";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function AdminForm() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { storeId, loading: storeLoading } = useActiveStore();
  const { type, mode, productId } = route.params || {};

  const readOnly = mode === "view";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

  useEffect(() => {
    if (storeId && type === "inventory") load();
  }, [storeId, productId]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("store_inventory")
      .select(
        `
        stock_value,
        products (
          price,
          mrp,
          user_visibility
        )
      `
      )
      .eq("store_id", storeId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error || !data) {
      Alert.alert("Error", "Failed to load inventory");
      setLoading(false);
      return;
    }

    const v = {
      stock_value: String(data.stock_value ?? ""),
      price: String(data.products.price ?? ""),
      mrp: String(data.products.mrp ?? ""),
      user_visibility: !!data.products.user_visibility,
    };

    setValues(v);
    setOriginalValues(v);
    setLoading(false);
  }

  function setField(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function isDirty() {
    return Object.keys(values).some(
      (k) => String(values[k]) !== String(originalValues[k])
    );
  }

  async function handleSave() {
    if (readOnly || !isDirty()) return;

    setSaving(true);
    const ops = [];

    // Inventory update
    if (values.stock_value !== originalValues.stock_value) {
      ops.push(
        supabase
          .from("store_inventory")
          .update({ stock_value: Number(values.stock_value) })
          .eq("store_id", storeId)
          .eq("product_id", productId)
      );
    }

    // Product update
    const productPayload = {};
    if (values.price !== originalValues.price)
      productPayload.price = Number(values.price);
    if (values.mrp !== originalValues.mrp)
      productPayload.mrp = Number(values.mrp);
    if (values.user_visibility !== originalValues.user_visibility)
      productPayload.user_visibility = values.user_visibility;

    if (Object.keys(productPayload).length) {
      ops.push(
        supabase.from("products").update(productPayload).eq("id", productId)
      );
    }

    const results = await Promise.all(ops);
    const err = results.find((r) => r?.error)?.error;

    setSaving(false);

    if (err) {
      Alert.alert("Error", err.message || "Failed to save");
      return;
    }

    navigation.goBack();
  }

  if (storeLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + 100,
          }}
        >
          <Card>
            {/* Stock */}
            <FieldLabel label="Stock Quantity" />
            <Input
              value={values.stock_value}
              onChangeText={(v) => setField("stock_value", v)}
              keyboardType="numeric"
              editable={!readOnly}
            />

            {/* Price */}
            <FieldLabel label="Selling Price" />
            <Input
              value={values.price}
              onChangeText={(v) => setField("price", v)}
              keyboardType="numeric"
              editable={!readOnly}
            />

            {/* MRP */}
            <FieldLabel label="MRP" />
            <Input
              value={values.mrp}
              onChangeText={(v) => setField("mrp", v)}
              keyboardType="numeric"
              editable={!readOnly}
            />

            {/* Visibility */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.md,
              }}
            >
              <Text style={{ flex: 1, color: colors.textSecondary }}>
                Visible to users
              </Text>
              <Switch
                value={values.user_visibility}
                onValueChange={(v) => setField("user_visibility", v)}
                disabled={readOnly}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
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
            flexDirection: "row",
            columnGap: spacing.sm,
          }}
        >
          <Button
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          >
            {readOnly ? "Close" : "Cancel"}
          </Button>

          {!readOnly && (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={!isDirty()}
              style={{ flex: 1 }}
            >
              Save
            </Button>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function FieldLabel({ label }) {
  return (
    <Text style={{ marginBottom: 6, color: colors.textSecondary }}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
  },
});
