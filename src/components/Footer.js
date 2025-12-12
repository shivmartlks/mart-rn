import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { colors, spacing, textSizes } from "../theme";
import { userTabs, adminTabs } from "../const/FooterTabsConfig";

// Footer acts as a custom tabBar for bottom tab navigator
export default function Footer({ role = "user", state, navigation }) {
  const tabsConfig = role === "admin" ? adminTabs : userTabs;

  // Helper: get icon name from config for a given route name
  const getIcon = (routeName) => {
    const match = tabsConfig.find(
      (t) =>
        t.path === routeName || t.key === routeName || t.label === routeName
    );
    return match?.icon ?? "circle";
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.footer}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const tint = isActive ? colors.gray900 : colors.gray500;
          const label = route.name; // keep label from route name

          const onPress = () => {
            // Emit tabPress and navigate by route name
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabBtn}
              activeOpacity={0.85}
            >
              <Feather
                name={getIcon(route.name)}
                size={22}
                color={tint}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                  { color: tint },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.cardBG,
  },
  footer: {
    height: 60,
    backgroundColor: colors.cardBG,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadowBase,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { height: -2, width: 0 },
    paddingHorizontal: spacing.md,
  },
  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: textSizes.xs,
    fontWeight: "500",
  },
  activeLabel: {
    fontWeight: "600",
  },
});
