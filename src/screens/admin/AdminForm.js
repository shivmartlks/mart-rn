import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "../../components/ui/BottomSheet";
import {
  fetchCategories,
  fetchSubCategories,
  fetchGroups,
} from "../../services/adminApi";
import { cacheClear } from "../../services/cache";
import { Platform, KeyboardAvoidingView } from "react-native";

// Field configs per type
const FIELD_CONFIG = {
  category: [
    { key: "name", label: "Category Name", type: "text", required: true },
    { key: "user_visibility", label: "Visible to users", type: "boolean" },
  ],
  subcategory: [
    { key: "name", label: "Subcategory Name", type: "text", required: true },
    { key: "category_id", label: "Category ID", type: "text", required: true },
    { key: "user_visibility", label: "Visible to users", type: "boolean" },
  ],
  group: [
    { key: "name", label: "Group Name", type: "text", required: true },
    {
      key: "subcategory_id",
      label: "Subcategory ID",
      type: "text",
      required: true,
    },
    { key: "user_visibility", label: "Visible to users", type: "boolean" },
  ],
  product: [
    { key: "name", label: "Product Name", type: "text", required: true },
    { key: "short_desc", label: "Short Description", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "mrp", label: "MRP", type: "number" },
    { key: "price", label: "Selling Price", type: "number", required: true },
    { key: "stock_value", label: "Stock Quantity", type: "number" },
    { key: "stock_type", label: "Stock Type", type: "text" },
    { key: "stock_unit", label: "Stock Unit", type: "text" },
    { key: "group_id", label: "Group ID", type: "text", required: true },
    { key: "images", label: "Images (JSON array)", type: "json" },
    {
      key: "highlights",
      label: "Highlights (JSON array of {name,value})",
      type: "json",
    },
    {
      key: "more_info",
      label: "More Info (JSON array of {name,value})",
      type: "json",
    },
    { key: "user_visibility", label: "Visible to users", type: "boolean" },
  ],
};

const TABLES = {
  category: "product_categories",
  subcategory: "product_subcategories",
  group: "product_groups",
  product: "products",
};

export default function AdminForm() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type, mode, id } = route.params || {};

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showSubcatPicker, setShowSubcatPicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [originalValues, setOriginalValues] = useState({});

  useEffect(() => {
    if (id) load();
    else setOriginalValues({});
  }, [id]);

  useEffect(() => {
    if (type === "subcategory") loadCategories();
    if (type === "group" || type === "product") loadSubcats();
    if (type === "product") loadGroupsForProduct();
  }, [type]);

  async function load() {
    setLoading(true);
    const table = TABLES[type];
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setLoading(false);
    if (error) {
      Alert.alert("Error", `Failed to load ${type}`);
      return;
    }
    setValues({
      ...data,
      user_visibility: !!data?.user_visibility,
    });
    setOriginalValues({
      ...data,
      user_visibility: !!data?.user_visibility,
    });
  }

  async function loadCategories() {
    const { data, error } = await fetchCategories();
    if (!error) setCategories(data || []);
  }

  async function loadSubcats() {
    const { data, error } = await fetchSubCategories();
    if (!error) setSubcats(data || []);
  }

  async function loadGroupsForProduct() {
    const { data, error } = await fetchGroups();
    if (!error) setGroupsList(data || []);
  }

  function setField(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function setArrayField(key, updater) {
    setValues((prev) => ({
      ...prev,
      [key]: updater(Array.isArray(prev[key]) ? prev[key] : []),
    }));
  }

  function validateFields() {
    const fields = FIELD_CONFIG[type] || [];
    // Required checks
    for (const f of fields) {
      const v = values[f.key];
      if (f.required) {
        const str = v == null ? "" : String(v).trim();
        if (!str) return false;
      }
      if (f.type === "number" && v != null) {
        const num = Number(v);
        if (Number.isNaN(num)) return false;
      }
      if (f.type === "json" && v != null && v !== "") {
        try {
          if (typeof v === "string") JSON.parse(v);
        } catch (e) {
          return false;
        }
      }
    }
    // Special: selector IDs must be present
    if (type === "subcategory" && !values.category_id) return false;
    if (type === "group" && !values.subcategory_id) return false;
    if (type === "product" && !values.group_id) return false;
    return true;
  }

  function isDirty() {
    // In add mode, treat as dirty when any required field has a value
    if (!id) return validateFields();
    const fields = FIELD_CONFIG[type] || [];
    for (const f of fields) {
      const a = values[f.key];
      const b = originalValues[f.key];
      // Normalize JSON for comparison
      if (f.type === "json") {
        const na = typeof a === "string" ? a : JSON.stringify(a ?? "");
        const nb = typeof b === "string" ? b : JSON.stringify(b ?? "");
        if (na !== nb) return true;
      } else {
        if (String(a ?? "") !== String(b ?? "")) return true;
      }
    }
    return false;
  }

  const valid = validateFields();
  const dirty = isDirty();

  async function handleSave() {
    if (!valid) return;
    if (id && !dirty) return;

    setSaving(true);
    const table = TABLES[type];
    const payload = { ...values };

    // Ensure boolean for visibility
    if (typeof payload.user_visibility !== "undefined") {
      payload.user_visibility = !!payload.user_visibility;
    }

    // Normalize product repeater fields
    if (type === "product") {
      if (!Array.isArray(payload.images)) payload.images = [];
      if (!Array.isArray(payload.highlights)) payload.highlights = [];
      if (!Array.isArray(payload.more_info)) payload.more_info = [];
      // Strip empty rows
      payload.images = payload.images.filter((u) => String(u || "").trim());
      payload.highlights = payload.highlights.filter((r) =>
        String(r?.name || "").trim()
      );
      payload.more_info = payload.more_info.filter((r) =>
        String(r?.name || "").trim()
      );
    } else {
      // For other types keep previous JSON normalization
      ["images", "highlights", "more_info"].forEach((k) => {
        if (payload[k]) {
          try {
            if (typeof payload[k] === "string")
              payload[k] = JSON.parse(payload[k]);
          } catch (e) {
            // ignore for non-product types
          }
        }
      });
    }

    const q = id
      ? supabase.from(table).update(payload).eq("id", id)
      : supabase.from(table).insert([payload]);

    const { error } = await q;
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message || "Failed to save");
      return;
    }

    // Clear relevant caches so visibility changes reflect immediately
    try {
      if (type === "category") {
        cacheClear("categories");
        cacheClear("product_categories");
      } else if (type === "subcategory") {
        cacheClear("subcategories");
        cacheClear("product_subcategories");
        cacheClear("groups");
      } else if (type === "group") {
        cacheClear("groups");
        cacheClear("product_groups");
        cacheClear("products");
      } else if (type === "product") {
        cacheClear("products");
      }
    } catch {}

    navigation.goBack();
  }

  function FieldLabel({ label, required }) {
    return (
      <Text style={{ marginBottom: 6, color: colors.textSecondary }}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
    );
  }

  function ImageRepeater() {
    const readOnly = mode === "view";
    const arr = Array.isArray(values.images) ? values.images : [];
    return (
      <View style={{ marginBottom: spacing.md }}>
        <FieldLabel label="Images" required={false} />
        {arr.map((url, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.xs,
            }}
          >
            <Input
              placeholder={`Image URL #${idx + 1}`}
              value={url}
              editable={!readOnly}
              onChangeText={(v) =>
                setArrayField("images", (prev) =>
                  prev.map((x, i) => (i === idx ? v : x))
                )
              }
              size="md"
              style={{ flex: 1 }}
            />
            {!readOnly && (
              <Button
                variant="secondary"
                size="sm"
                style={{ marginLeft: spacing.xs }}
                onPress={() =>
                  setArrayField("images", (prev) =>
                    prev.filter((_, i) => i !== idx)
                  )
                }
              >
                Remove
              </Button>
            )}
          </View>
        ))}
        {!readOnly && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setArrayField("images", (prev) => [...prev, ""])}
          >
            Add Image
          </Button>
        )}
      </View>
    );
  }

  function NVRepeater({ fieldKey, label }) {
    const readOnly = mode === "view";
    const arr = Array.isArray(values[fieldKey]) ? values[fieldKey] : [];
    return (
      <View style={{ marginBottom: spacing.md }}>
        <FieldLabel label={label} required={false} />
        {arr.map((row, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.xs,
            }}
          >
            <Input
              placeholder="Name"
              value={row?.name ?? ""}
              editable={!readOnly}
              onChangeText={(v) =>
                setArrayField(fieldKey, (prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, name: v } : x))
                )
              }
              size="md"
              style={{ flex: 1, marginRight: spacing.xs }}
            />
            <Input
              placeholder="Value"
              value={row?.value ?? ""}
              editable={!readOnly}
              onChangeText={(v) =>
                setArrayField(fieldKey, (prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, value: v } : x))
                )
              }
              size="md"
              style={{ flex: 1 }}
            />
            {!readOnly && (
              <Button
                variant="secondary"
                size="sm"
                style={{ marginLeft: spacing.xs }}
                onPress={() =>
                  setArrayField(fieldKey, (prev) =>
                    prev.filter((_, i) => i !== idx)
                  )
                }
              >
                Remove
              </Button>
            )}
          </View>
        ))}
        {!readOnly && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() =>
              setArrayField(fieldKey, (prev) => [
                ...prev,
                { name: "", value: "" },
              ])
            }
          >
            Add Row
          </Button>
        )}
      </View>
    );
  }

  function renderField(f) {
    const val = values[f.key];
    const readOnly = mode === "view";

    // Special handling: subcategory category selector
    if (type === "subcategory" && f.key === "category_id") {
      const selectedCat = categories.find((c) => c.id === val);
      return (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
            Category
          </Text>
          <Button
            variant="secondary"
            onPress={() => !readOnly && setShowCatPicker(true)}
            disabled={readOnly}
            style={{ justifyContent: "flex-start" }}
            textStyle={{ color: colors.textPrimary }}
          >
            {selectedCat ? selectedCat.name : "Select Category"}
          </Button>

          {showCatPicker && (
            <BottomSheet
              visible
              title="Select Category"
              onClose={() => setShowCatPicker(false)}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    onPress={() => {
                      setField("category_id", cat.id);
                      setShowCatPicker(false);
                    }}
                    variant={val === cat.id ? "default" : "ghost"}
                    style={{ justifyContent: "flex-start" }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </View>
              <Button
                block
                variant="secondary"
                style={{ marginTop: spacing.sm }}
                onPress={() => setShowCatPicker(false)}
              >
                Close
              </Button>
            </BottomSheet>
          )}
        </View>
      );
    }

    // group: subcategory selector
    if (type === "group" && f.key === "subcategory_id") {
      const selected = subcats.find((s) => s.id === val);
      return (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
            Subcategory
          </Text>
          <Button
            variant="secondary"
            onPress={() => !readOnly && setShowSubcatPicker(true)}
            disabled={readOnly}
            style={{ justifyContent: "flex-start" }}
            textStyle={{ color: colors.textPrimary }}
          >
            {selected ? selected.name : "Select Subcategory"}
          </Button>

          {showSubcatPicker && (
            <BottomSheet
              visible
              title="Select Subcategory"
              onClose={() => setShowSubcatPicker(false)}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {subcats.map((s) => (
                  <Button
                    key={s.id}
                    onPress={() => {
                      setField("subcategory_id", s.id);
                      setShowSubcatPicker(false);
                    }}
                    variant={val === s.id ? "default" : "ghost"}
                    style={{ justifyContent: "flex-start" }}
                  >
                    {s.name}
                  </Button>
                ))}
              </View>
              <Button
                block
                variant="secondary"
                style={{ marginTop: spacing.sm }}
                onPress={() => setShowSubcatPicker(false)}
              >
                Close
              </Button>
            </BottomSheet>
          )}
        </View>
      );
    }

    // product: group selector
    if (type === "product" && f.key === "group_id") {
      const selected = groupsList.find((g) => g.id === val);
      return (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
            Group
          </Text>
          <Button
            variant="secondary"
            onPress={() => !readOnly && setShowGroupPicker(true)}
            disabled={readOnly}
            style={{ justifyContent: "flex-start" }}
            textStyle={{ color: colors.textPrimary }}
          >
            {selected ? selected.name : "Select Group"}
          </Button>

          {showGroupPicker && (
            <BottomSheet
              visible
              title="Select Group"
              onClose={() => setShowGroupPicker(false)}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {groupsList.map((g) => (
                  <Button
                    key={g.id}
                    onPress={() => {
                      setField("group_id", g.id);
                      setShowGroupPicker(false);
                    }}
                    variant={val === g.id ? "default" : "ghost"}
                    style={{ justifyContent: "flex-start" }}
                  >
                    {g.name}
                  </Button>
                ))}
              </View>
              <Button
                block
                variant="secondary"
                style={{ marginTop: spacing.sm }}
                onPress={() => setShowGroupPicker(false)}
              >
                Close
              </Button>
            </BottomSheet>
          )}
        </View>
      );
    }

    // Product stock_type toggle
    if (type === "product" && f.key === "stock_type") {
      const label =
        values.stock_type === "quantity" ? "Quantity (pcs)" : "Weight (kg)";
      return (
        <View style={{ marginBottom: spacing.md }}>
          <FieldLabel label="Stock Type" required={false} />
          <Button
            variant="secondary"
            onPress={() =>
              !readOnly &&
              setField(
                "stock_type",
                values.stock_type === "quantity" ? "weight" : "quantity"
              )
            }
            disabled={readOnly}
          >
            {label}
          </Button>
        </View>
      );
    }

    // Product repeats
    if (type === "product" && f.key === "images") {
      return <ImageRepeater />;
    }
    if (type === "product" && f.key === "highlights") {
      return <NVRepeater fieldKey="highlights" label="Highlights" />;
    }
    if (type === "product" && f.key === "more_info") {
      return <NVRepeater fieldKey="more_info" label="More Info" />;
    }

    switch (f.type) {
      case "text":
        return (
          <View style={{ marginBottom: spacing.md }}>
            <FieldLabel label={f.label} required={!!f.required} />
            <Input
              placeholder={f.label}
              value={val ?? ""}
              onChangeText={(v) => setField(f.key, v)}
              editable={!readOnly}
              size="md"
            />
          </View>
        );
      case "number":
        return (
          <View style={{ marginBottom: spacing.md }}>
            <FieldLabel label={f.label} required={!!f.required} />
            <Input
              placeholder={f.label}
              value={val != null ? String(val) : ""}
              onChangeText={(v) => setField(f.key, v)}
              editable={!readOnly}
              keyboardType="numeric"
              size="md"
            />
          </View>
        );
      case "boolean":
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{ marginRight: spacing.sm, color: colors.textSecondary }}
            >
              {f.label}
            </Text>
            <Switch
              value={!!val}
              onValueChange={(v) => setField(f.key, !!v)}
              disabled={readOnly}
            />
          </View>
        );
      case "json":
        return (
          <View style={{ marginBottom: spacing.md }}>
            <FieldLabel label={f.label} required={!!f.required} />
            <Input
              placeholder={f.label}
              value={
                val ? (typeof val === "string" ? val : JSON.stringify(val)) : ""
              }
              onChangeText={(v) => setField(f.key, v)}
              editable={!readOnly}
              multiline
              size="md"
              style={{ minHeight: 100 }}
            />
          </View>
        );
      default:
        return null;
    }
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );

  const fields = FIELD_CONFIG[type] || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Scrollable content with extra bottom padding to avoid overlap with fixed CTA */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            {fields.map((f) => (
              <View key={f.key}>{renderField(f)}</View>
            ))}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed bottom CTA with left-right alignment */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: colors.cardBG,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
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
          {mode === "view" ? (
            <Button
              block
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onPress={() => navigation.goBack()}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSave}
                loading={saving}
                disabled={!valid || (id && !dirty)}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
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
