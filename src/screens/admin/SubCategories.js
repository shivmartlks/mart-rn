import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import { fetchCategories, fetchSubCategories } from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import BottomSheet from "../../components/ui/BottomSheet";
import { colors, spacing, textSizes } from "../../theme";
import { useNavigation } from "@react-navigation/native";

export default function SubCategories() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    categoryId: "",
  });
  const [visibleNew, setVisibleNew] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await getCategories();
    await getSubCategories();
    setLoading(false);
  }

  async function getCategories() {
    const { data, error } = await fetchCategories();
    if (error) Alert.alert("Error", "Failed to load categories");
    else setCategories(data || []);
  }

  async function getSubCategories() {
    const { data, error } = await fetchSubCategories();
    if (error) Alert.alert("Error", "Failed to load subcategories");
    else setSubcategories(data || []);
  }

  async function handleAddSubcategory() {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      Alert.alert("Missing Fields", "Select category and enter a name.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("product_subcategories").insert([
      {
        name: newSubcategory.name,
        category_id: newSubcategory.categoryId,
        user_visibility: visibleNew,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // reset & reload
    setNewSubcategory({ name: "", categoryId: newSubcategory.categoryId });
    setVisibleNew(false);
    setAddOpen(false);
    getSubCategories();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("product_subcategories")
      .delete()
      .eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) Alert.alert("Error", "Failed to delete subcategory");
    else getSubCategories();
  }

  // ============================= LOADING =============================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  // ============================= CONTENT =============================
  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
        }}
      >
        {/* List table synced with Categories */}
        <View style={styles.card}>
          {/* Header row */}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, color: colors.textSecondary }}>
              Subcategory Name
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

          {subcategories.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No subcategories yet.
              </Text>
            </View>
          ) : (
            subcategories.map((s) => {
              const parent = categories.find((c) => c.id === s.category_id);
              return (
                <View
                  key={s.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderColor: colors.divider,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: textSizes.sm,
                      }}
                    >
                      {s.name}
                      <Text style={{ color: colors.textSecondary }}>
                        {" "}
                        ({parent?.name || "Unassigned"})
                      </Text>
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
                          type: "subcategory",
                          mode: "view",
                          id: s.id,
                        })
                      }
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onPress={() =>
                        navigation.navigate("AdminForm", {
                          type: "subcategory",
                          mode: "edit",
                          id: s.id,
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
                      onPress={() => setDeleteId(s.id)}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sticky Add Subcategory CTA (8px bottom padding) */}
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
                type: "subcategory",
                mode: "edit",
              })
            }
          >
            Add Subcategory
          </Button>
        </View>
      </SafeAreaView>

      {/* Delete confirmation bottom sheet */}
      {deleteId !== null && (
        <BottomSheet
          visible
          title="Delete Subcategory"
          onClose={() => setDeleteId(null)}
        >
          <Text style={{ color: colors.textSecondary }}>
            Are you sure you want to delete this subcategory?
          </Text>
          <Button
            block
            style={{ marginTop: spacing.lg }}
            onPress={confirmDelete}
            loading={deleting}
          >
            Yes, Delete
          </Button>
          <Button
            block
            variant="secondary"
            style={{ marginTop: spacing.sm }}
            onPress={() => setDeleteId(null)}
          >
            No, Cancel
          </Button>
        </BottomSheet>
      )}
    </View>
  );
}

// ============================= STYLES =============================
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    fontSize: 16,
    marginTop: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  emptyText: {
    color: "#777",
  },

  listItem: {
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 8,
  },

  listText: {
    fontSize: 16,
    color: "#333",
  },

  mutedText: {
    color: "#888",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  dropdownLabel: {
    marginBottom: 8,
    color: "#555",
  },

  option: {
    justifyContent: "flex-start",
  },

  optionText: {
    fontWeight: "normal",
  },
});
