// src/components/ui/Header.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  colors,
  textSizes,
  spacing,
  componentTokens,
  shadows,
} from "../../theme";

export default function Header({
  title = "",
  showBack = true,
  right = null, // pass an icon or button
  shadow = false, // enable header shadow
  style = {},
}) {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, shadow && shadows.header, style]}>
      {/* Left Section */}
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // placeholder spacing
        )}
      </View>

      {/* Center Title */}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Section */}
      <View style={styles.right}>
        {right ? (
          <View style={styles.rightContainer}>{right}</View>
        ) : (
          <View style={{ width: 24 }} /> // placeholder balance
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: componentTokens.header.height,
    backgroundColor: componentTokens.header.bg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: componentTokens.header.borderBottom,
  },

  left: {
    width: 50,
    justifyContent: "flex-start",
  },

  center: {
    flex: 1,
    alignItems: "center",
  },

  right: {
    width: 50,
    alignItems: "flex-end",
  },

  backButton: {
    padding: spacing.sm,
  },

  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },

  title: {
    fontSize: componentTokens.header.titleSize,
    color: componentTokens.header.titleColor,
    fontWeight: "600",
  },

  rightContainer: {
    padding: spacing.sm,
  },
});
