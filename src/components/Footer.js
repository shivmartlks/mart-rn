import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

// Feather icons (Lucide alternative)
import Feather from "react-native-vector-icons/Feather";

// ------------------------------
// TAB CONFIG (User + Admin)
// ------------------------------

export const userTabs = [
  { key: "Home", label: "Home", icon: "home", path: "Home" },
  { key: "Shop", label: "Shop", icon: "shopping-bag", path: "Shop" },
  { key: "Cart", label: "Cart", icon: "shopping-cart", path: "Cart" },
  { key: "Orders", label: "Orders", icon: "clipboard", path: "Orders" },
  { key: "Profile", label: "Profile", icon: "user", path: "Profile" },
];

export const adminTabs = [
  { key: "Home", label: "Dashboard", icon: "home", path: "AdminHome" },
  {
    key: "Products",
    label: "Products",
    icon: "shopping-bag",
    path: "ManageProducts",
  },
  { key: "Orders", label: "Orders", icon: "clipboard", path: "AdminOrders" },
  { key: "Profile", label: "Profile", icon: "user", path: "Profile" },
];

// ------------------------------
// FOOTER COMPONENT
// ------------------------------

export default function Footer({ role = "user" }) {
  const navigation = useNavigation();
  const route = useRoute();

  // choose tab set based on role
  const tabs = role === "admin" ? adminTabs : userTabs;
  const current = route.name;

  return (
    <View style={styles.footer}>
      {tabs.map(({ key, label, icon, path }) => {
        const isActive = current === path;

        return (
          <TouchableOpacity
            key={key}
            onPress={() => navigation.navigate(path)}
            style={styles.tabBtn}
            activeOpacity={0.7}
          >
            <Feather
              name={icon}
              size={22}
              color={isActive ? "#000" : "#999"}
              style={{ marginBottom: 2 }}
            />

            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ------------------------------
// STYLES
// ------------------------------

const styles = StyleSheet.create({
  footer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { height: -2 },
  },

  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 10,
    color: "#999",
  },

  activeLabel: {
    color: "#000",
    fontWeight: "600",
  },
});
