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
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await fetchCategories();

    if (error) {
      Alert.alert("Error", "Failed to fetch categories");
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from("product_categories")
      .insert([{ name: newCategory }]);

    if (error) {
      Alert.alert("Error", "Could not add category");
      return;
    }

    setNewCategory("");
    loadCategories();
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.screenBG }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text
        style={{
          fontSize: textSizes.lg,
          fontWeight: fontWeights.bold,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        Add New Category
      </Text>

      {/* Add Category Box */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Input
          placeholder="Category Name"
          value={newCategory}
          onChangeText={setNewCategory}
          size="md"
          style={{ marginBottom: spacing.md }}
        />
        <Button block onPress={handleAddCategory}>
          Add Category
        </Button>
      </Card>

      {/* Category List */}
      <Card>
        <Text
          style={{
            fontSize: textSizes.md,
            fontWeight: fontWeights.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
          }}
        >
          Existing Categories
        </Text>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: spacing.sm }}
          />
        ) : categories.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
            <Text
              style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
            >
              No categories yet.
            </Text>
          </View>
        ) : (
          categories.map((c) => (
            <View
              key={c.id}
              style={{
                paddingVertical: spacing.sm,
                borderBottomWidth: 1,
                borderColor: colors.divider,
              }}
            >
              <Text
                style={{ fontSize: textSizes.md, color: colors.textPrimary }}
              >
                {c.name}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  // ...remove hardcoded styles; using theme components above...
});
