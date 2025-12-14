import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { fetchCategories } from "../../services/adminApi";
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes } from "../../theme";
import Card from "../../components/ui/Card";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Categories() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await fetchCategories();
    if (error) Alert.alert("Error", "Failed to fetch categories");
    else setCategories(data || []);
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) Alert.alert("Error", "Failed to delete category");
    else loadCategories();
  }

  function renderRow(c) {
    return (
      <View
        key={c.id}
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
            {c.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", columnGap: spacing.xs }}>
          <Button
            size="sm"
            variant="secondary"
            onPress={() =>
              navigation.getParent()?.navigate("AdminForm", {
                type: "category",
                mode: "view",
                id: c.id,
              })
            }
          >
            View
          </Button>
          <Button
            size="sm"
            onPress={() =>
              navigation.getParent()?.navigate("AdminForm", {
                type: "category",
                mode: "edit",
                id: c.id,
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
            onPress={() => setDeleteId(c.id)}
          >
            Delete
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
        {/* Section: Category list (table-like) */}
        <Card style={{ padding: spacing.md, marginBottom: spacing.lg }}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: spacing.sm }}
            />
          ) : (Array.isArray(categories) ? categories.length === 0 : true) ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No categories yet.
              </Text>
            </View>
          ) : (
            <View>
              {/* Header row */}
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: spacing.xs,
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ flex: 1, color: colors.textSecondary }}>
                  Category Name
                </Text>
                <Text
                  style={{
                    width: 180,
                    textAlign: "right",
                    color: colors.textSecondary,
                  }}
                >
                  Actions
                </Text>
              </View>
              {categories.map(renderRow)}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Sticky Add Category CTA -> navigate to AdminForm (edit/add) */}
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
              navigation.getParent()?.navigate("AdminForm", {
                type: "category",
                mode: "edit",
              })
            }
          >
            Add Category
          </Button>
        </View>
      </SafeAreaView>

      {/* Delete confirmation bottom sheet */}
      {deleteId !== null && (
        <BottomSheet
          visible
          title="Delete Category"
          onClose={() => setDeleteId(null)}
        >
          <Text style={{ color: colors.textSecondary }}>
            Are you sure you want to delete this category?
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

const styles = StyleSheet.create({});
