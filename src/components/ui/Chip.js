// src/components/ui/Chip.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, textSizes, spacing, radii, fontWeights } from "../../theme";

export default function Chip({
  label,
  selected = false,
  onPress = null,
  size = "md", // sm | md
  leftIcon = null,
  rightIcon = null, // e.g., "x" icon for removable chips
  style = {},
  textStyle = {},
}) {
  const sizeMap = {
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: textSizes.xs,
      height: 30,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      fontSize: textSizes.sm,
      height: 36,
    },
  };

  const s = sizeMap[size];

  const bgColor = selected ? colors.gray100 : colors.gray100;
  const borderColor = selected ? colors.gray500 : colors.gray200;
  const textColor = selected ? colors.gray900 : colors.gray500;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: radii.full,
          height: s.height,
        },
        style,
      ]}
    >
      {/* Left Icon */}
      {leftIcon && <View style={{ marginRight: 6 }}>{leftIcon}</View>}

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: textColor, fontSize: s.fontSize },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Right icon (optional, e.g. close "x") */}
      {rightIcon && <View style={{ marginLeft: 6 }}>{rightIcon}</View>}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    alignSelf: "flex-start", // auto width based on content
  },
  label: {
    fontWeight: fontWeights.medium,
  },
});
