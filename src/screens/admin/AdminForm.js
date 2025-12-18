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
    { key: "mrp", label: "MRP", type: "number" },
    { key: "price", label: "Selling Price", type: "number", required: true },
    { key: "stock_value", label: "Stock Quantity", type: "number" },
    { key: "stock_type", label: "Stock Type", type: "text" },
    { key: "stock_unit", label: "Stock Unit", type: "text" },
    { key: "group_id", label: "Group ID", type: "text", required: true },
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
  // Product-only extra UI state
  const [adminMoreOpen, setAdminMoreOpen] = useState(false);
  const [specsDupError, setSpecsDupError] = useState("");

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

    if (error) {
      setLoading(false);
      Alert.alert("Error", `Failed to load ${type}`);
      return;
    }

    // Base values from core table
    const base = {
      ...data,
      user_visibility: !!data?.user_visibility,
    };

    // Prefill extras for product edit
    if (type === "product" && id) {
      const [imgRes, attrRes] = await Promise.all([
        supabase
          .from("product_images")
          .select("image_url, sort_order")
          .eq("product_id", id)
          .order("sort_order"),
        supabase
          .from("product_attributes")
          .select("key, value, group_key")
          .eq("product_id", id),
      ]);

      const images = Array.isArray(imgRes?.data)
        ? imgRes.data
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((r) => String(r.image_url || ""))
        : [];

      const highlights = [];
      const more_info = [];
      let descriptionText = "";
      let nutritionText = "";
      (attrRes?.data || []).forEach((r) => {
        const g = r?.group_key;
        const k = String(r?.key || "").trim();
        const v = String(r?.value || "").trim();
        if (g === "highlights" && v) highlights.push(v);
        else if (g === "details" && k) more_info.push({ name: k, value: v });
        else if (g === "description" && v) descriptionText = v;
        else if (g === "nutrition" && v) nutritionText = v;
      });

      base.images = images;
      base.highlights = highlights;
      base.more_info = more_info;
      base.descriptionText = descriptionText;
      base.nutritionText = nutritionText;
    }

    setValues(base);
    setOriginalValues(base);
    setLoading(false);
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

  function validateProductSpecs() {
    // Prevent duplicate spec keys (case/trim insensitive) at UI-level
    const specs = Array.isArray(values.more_info) ? values.more_info : [];
    const seen = new Set();
    for (const row of specs) {
      const name = String(row?.name || "")
        .trim()
        .toLowerCase();
      if (!name) continue;
      if (seen.has(name)) {
        setSpecsDupError("Duplicate specification keys are not allowed.");
        return false;
      }
      seen.add(name);
    }
    setSpecsDupError("");
    return true;
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

    // Product-specific: prevent duplicate spec keys
    if (type === "product") {
      if (!validateProductSpecs()) return false;
    }

    return true;
  }

  function isDirty() {
    // In add mode, treat as dirty when any required field has a value
    if (!id) return validateFields();
    // For product, shallow compare core fields + extras we manage
    if (type === "product") {
      const keysToCompare = [
        "name",
        "short_desc",
        "mrp",
        "price",
        "stock_value",
        "stock_type",
        "stock_unit",
        "group_id",
        "user_visibility",
        // extras
        "images",
        "highlights",
        "more_info",
        "descriptionText",
        "nutritionText",
      ];
      for (const k of keysToCompare) {
        const a = values[k];
        const b = originalValues[k];
        const sa = JSON.stringify(a ?? null);
        const sb = JSON.stringify(b ?? null);
        if (sa !== sb) return true;
      }
      return false;
    }

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

    // Remove non-core fields from payload for products (images/highlights/specs/long text)
    if (type === "product") {
      delete payload.images;
      delete payload.highlights;
      delete payload.more_info;
      delete payload.descriptionText;
      delete payload.nutritionText;
    }

    // Save core record
    const q = id
      ? supabase.from(table).update(payload).eq("id", id)
      : supabase.from(table).insert([payload]).select().maybeSingle();

    const result = await q;
    if (result.error) {
      setSaving(false);
      Alert.alert("Error", result.error.message || "Failed to save");
      return;
    }

    // Resolve productId (for new insert get from returning row)
    const productId =
      type === "product" ? id || result.data?.id || values.id : null;

    // For products: persist images and attributes
    if (type === "product" && productId) {
      try {
        // Images: delete and insert with sort_order
        const imagesArr = Array.isArray(values.images)
          ? values.images.map((u) => String(u || "").trim()).filter((u) => !!u)
          : [];
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);
        if (imagesArr.length > 0) {
          await supabase.from("product_images").insert(
            imagesArr.map((url, idx) => ({
              product_id: productId,
              image_url: url,
              sort_order: idx,
            }))
          );
        }

        // Attributes: delete and insert
        await supabase
          .from("product_attributes")
          .delete()
          .eq("product_id", productId);

        const attrRows = [];

        // Highlights (single-line text repeater)
        const highlightsArr = Array.isArray(values.highlights)
          ? values.highlights
              .map((h) => String(h || "").trim())
              .filter((h) => !!h)
          : [];
        highlightsArr.forEach((value) => {
          attrRows.push({
            product_id: productId,
            key: "highlight",
            value,
            group_key: "highlights",
          });
        });

        // Specifications (key/value) with duplicate prevention already in validation)
        const detailsArr = Array.isArray(values.more_info)
          ? values.more_info
          : [];
        detailsArr.forEach((d) => {
          const name = String(d?.name || "").trim();
          const value = String(d?.value || "").trim();
          if (name) {
            attrRows.push({
              product_id: productId,
              key: name,
              value,
              group_key: "details",
            });
          }
        });

        // Description (single long text, optional)
        const descriptionText = String(values.descriptionText || "").trim();
        if (descriptionText) {
          attrRows.push({
            product_id: productId,
            key: "description",
            value: descriptionText,
            group_key: "description",
          });
        }

        // Nutrition info (single long text, optional)
        const nutritionText = String(values.nutritionText || "").trim();
        if (nutritionText) {
          attrRows.push({
            product_id: productId,
            key: "nutrition_info",
            value: nutritionText,
            group_key: "nutrition",
          });
        }

        if (attrRows.length > 0) {
          await supabase.from("product_attributes").insert(attrRows);
        }
      } catch (e) {
        // Non-fatal: show error but still continue
        Alert.alert(
          "Warning",
          "Saved product, but failed to save images/attributes."
        );
      }
    }

    setSaving(false);

    // Clear caches
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
        if (productId) cacheClear(`product:${productId}`);
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
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ marginLeft: spacing.xs }}
                  onPress={() =>
                    setArrayField("images", (prev) => {
                      if (idx <= 0) return prev;
                      const copy = [...prev];
                      const [it] = copy.splice(idx, 1);
                      copy.splice(idx - 1, 0, it);
                      return copy;
                    })
                  }
                >
                  Up
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ marginLeft: spacing.xs }}
                  onPress={() =>
                    setArrayField("images", (prev) => {
                      if (idx >= prev.length - 1) return prev;
                      const copy = [...prev];
                      const [it] = copy.splice(idx, 1);
                      copy.splice(idx + 1, 0, it);
                      return copy;
                    })
                  }
                >
                  Down
                </Button>
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
              </>
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

  function TextRepeater({ fieldKey, label, placeholder = "Text" }) {
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
              placeholder={placeholder}
              value={String(row ?? "")}
              editable={!readOnly}
              onChangeText={(v) =>
                setArrayField(fieldKey, (prev) =>
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
            onPress={() => setArrayField(fieldKey, (prev) => [...prev, ""])}
          >
            Add Row
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
        {specsDupError && fieldKey === "more_info" ? (
          <Text style={{ color: colors.danger, marginTop: spacing.xs }}>
            {specsDupError}
          </Text>
        ) : null}
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
          {/* Product: custom sectioned UI */}
          {type === "product" ? (
            <>
              <Card>
                <Text
                  style={{
                    fontWeight: fontWeights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                  }}
                >
                  Basic Info
                </Text>
                {fields
                  .filter((f) =>
                    [
                      "name",
                      "short_desc",
                      "mrp",
                      "price",
                      "stock_value",
                      "stock_type",
                      "stock_unit",
                      "group_id",
                      "user_visibility",
                    ].includes(f.key)
                  )
                  .map((f) => (
                    <View key={f.key}>{renderField(f)}</View>
                  ))}
              </Card>

              <View style={{ height: spacing.md }} />

              <Card>
                <Text
                  style={{
                    fontWeight: fontWeights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                  }}
                >
                  Images
                </Text>
                <ImageRepeater />
              </Card>

              <View style={{ height: spacing.md }} />

              <Card>
                <Text
                  style={{
                    fontWeight: fontWeights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                  }}
                >
                  Highlights
                </Text>
                <TextRepeater
                  fieldKey="highlights"
                  label="Highlights"
                  placeholder="Highlight"
                />
              </Card>

              <View style={{ height: spacing.md }} />

              <Card>
                <Text
                  style={{
                    fontWeight: fontWeights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                  }}
                >
                  Specifications
                </Text>
                <NVRepeater fieldKey="more_info" label="Specifications" />
              </Card>

              <View style={{ height: spacing.md }} />

              <Card>
                <Button
                  variant="secondary"
                  onPress={() => setAdminMoreOpen((s) => !s)}
                >
                  {adminMoreOpen ? "Hide more info" : "Add more info"}
                </Button>

                {adminMoreOpen && (
                  <View style={{ marginTop: spacing.md }}>
                    <View style={{ marginBottom: spacing.md }}>
                      <FieldLabel label="Description" required={false} />
                      <Input
                        placeholder="Description"
                        value={values.descriptionText ?? ""}
                        onChangeText={(v) => setField("descriptionText", v)}
                        multiline
                        size="md"
                        style={{ minHeight: 100 }}
                      />
                    </View>

                    <View style={{ marginBottom: spacing.sm }}>
                      <FieldLabel
                        label="Nutrition info (optional)"
                        required={false}
                      />
                      <Input
                        placeholder="Nutrition info"
                        value={values.nutritionText ?? ""}
                        onChangeText={(v) => setField("nutritionText", v)}
                        multiline
                        size="md"
                        style={{ minHeight: 80 }}
                      />
                    </View>
                  </View>
                )}
              </Card>
            </>
          ) : (
            <Card>
              {fields.map((f) => (
                <View key={f.key}>{renderField(f)}</View>
              ))}
            </Card>
          )}
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

async function saveProductAttributes(productId, attributes) {
  if (!Array.isArray(attributes)) return;

  // Remove old attributes
  await supabase
    .from("product_attributes")
    .delete()
    .eq("product_id", productId);

  if (attributes.length === 0) return;

  const rows = attributes
    .map((r) => ({
      product_id: productId,
      key: r.name?.trim(),
      value: r.value?.trim(),
    }))
    .filter((r) => r.key && r.value);

  if (rows.length > 0) {
    await supabase.from("product_attributes").insert(rows);
  }
}
