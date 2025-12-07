import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

// Import your RN-converted admin screens
import CategoriesScreen from "./Categories";
import SubCategoriesScreen from "./SubCategories";
import GroupsScreen from "./Groups";
import ProductsScreen from "./Products";

export default function ManageProducts() {
  const [activeTab, setActiveTab] = useState("categories");

  const tabs = ["categories", "subcategories", "groups", "products"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Products</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "categories" && <CategoriesScreen />}
        {activeTab === "subcategories" && <SubCategoriesScreen />}
        {activeTab === "groups" && <GroupsScreen />}
        {activeTab === "products" && <ProductsScreen />}
      </View>
    </View>
  );
}


// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { height: 2 },
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
    marginRight: 10,
  },

  tabButtonActive: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { height: 2 },
  },

  tabText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },

  tabTextActive: {
    color: "#FFF",
  },

  content: {
    flex: 1,
    padding: 16,
  },
});
