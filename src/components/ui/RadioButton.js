// src/components/ui/RadioButton.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, spacing, textSizes, radii, fontWeights } from "../../theme";

export default function RadioButton({
  label,
  note,
  checked = false,
  disabled = false,
  size = "md", // "sm" | "md"
  onPress = () => {},
  style,
  labelStyle,
  noteStyle,
  testID,
  accessibilityLabel,
}) {
  const sizeMap = {
    sm: { height: 32, outer: 16, inner: 8, fontSize: textSizes.sm },
    md: { height: 40, outer: 20, inner: 10, fontSize: textSizes.md },
  };
  const s = sizeMap[size] || sizeMap.md;

  const outerStyle = {
    width: s.outer,
    height: s.outer,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: checked ? colors.primary : colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: checked ? colors.primary : "transparent",
  };

  const innerStyle = {
    width: s.inner,
    height: s.inner,
    borderRadius: radii.full,
    backgroundColor: checked ? colors.surface : "transparent",
  };

  const labelColor = disabled
    ? colors.textMuted
    : checked
    ? colors.textPrimary
    : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : undefined}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      style={[
        {
          minHeight: s.height,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
        },
        style,
      ]}
      testID={testID}
    >
      <View style={outerStyle}>
        {checked ? <View style={innerStyle} /> : null}
      </View>

      <View style={{ marginLeft: spacing.sm, flex: 1 }}>
        <Text
          style={[
            {
              fontSize: s.fontSize,
              color: labelColor,
              fontWeight: fontWeights?.medium ?? "600",
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
        {note ? (
          <Text
            style={[
              {
                fontSize: textSizes.sm,
                color: colors.textSecondary,
                marginTop: 4,
              },
              noteStyle,
            ]}
          >
            {note}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
