// src/components/ui/SectionTitle.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, textSizes, spacing } from "../../theme";

export default function SectionTitle({
  title,
  subtitle = "",
  action = null, // optional right-side button/link
  style = {},
  titleStyle = {},
  subtitleStyle = {},
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Left side: Title + Subtitle */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>

        {subtitle ? (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Right side action button */}
      {action ? (
        <TouchableOpacity style={styles.actionButton}>
          {action}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: textSizes.lg,
    color: colors.textPrimary,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  actionButton: {
    marginLeft: spacing.sm,
  },
});
