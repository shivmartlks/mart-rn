// src/components/ui/ListTile.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, textSizes, spacing, fontWeights } from "../../theme";

export default function ListTile({
  title,
  subtitle = "",
  left = null, // icon or custom node
  right = null, // value text or custom node
  showArrow = false, // show ">" arrow
  onPress = null, // makes ListTile clickable
  disabled = false,
  style = {},
  titleStyle = {},
  subtitleStyle = {},
  rightStyle = {},
}) {
  const TileWrapper = onPress ? TouchableOpacity : View;

  return (
    <TileWrapper
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[styles.container, style]}
    >
      {/* Left icon */}
      {left ? <View style={styles.left}>{left}</View> : null}

      {/* Middle content */}
      <View style={styles.middle}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right value or component */}
      {right ? (
        <View style={styles.right}>
          <Text style={[styles.rightText, rightStyle]} numberOfLines={1}>
            {right}
          </Text>
        </View>
      ) : null}

      {/* Arrow */}
      {showArrow ? <Text style={styles.arrow}>›</Text> : null}
    </TileWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },

  left: {
    marginRight: spacing.md,
  },

  middle: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },

  subtitle: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  right: {
    marginLeft: spacing.md,
  },

  rightText: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
  },

  arrow: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
