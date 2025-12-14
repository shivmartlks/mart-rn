import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import CategoriesScreen from "./Categories";
import SubCategoriesScreen from "./SubCategories";
import GroupsScreen from "./Groups";
import ProductsScreen from "./Products";

export default function ManageProducts() {
  const [activeTab, setActiveTab] = useState("categories");
  const tabs = [
    { key: "categories", label: "Categories" },
    { key: "subcategories", label: "Subcategories" },
    { key: "groups", label: "Groups" },
    { key: "products", label: "Products" },
  ];

  return (
    <View style={styles.container}>
      {/* Top filter chips row (removed page heading) */}
      <View style={styles.filtersRow}>
        {tabs.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            selected={activeTab === t.key}
            onPress={() => setActiveTab(t.key)}
            style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}
          />
        ))}
      </View>

      {/* Full-width content below */}
      <View style={styles.content}>
        {activeTab === "categories" && <CategoriesScreen />}
        {activeTab === "subcategories" && <SubCategoriesScreen />}
        {activeTab === "groups" && <GroupsScreen />}
        {activeTab === "products" && <ProductsScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenBG },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBG,
  },
  content: {
    flex: 1,
  },
});
