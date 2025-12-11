// src/components/ui/Input.js

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  colors,
  textSizes,
  spacing,
  radii,
  componentTokens,
} from "../../theme";

export default function Input({
  label,
  error = "",
  helper = "",
  size = "md", // NEW: sm | md | lg
  style = {},
  inputStyle = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  // Base tokens
  const tokens = componentTokens.input;

  // NEW: dynamic size map
  const sizeMap = {
    sm: {
      height: 32,
      fontSize: textSizes.sm,
      paddingVertical: spacing.xs,
      radius: radii.sm,
    },
    md: {
      height: 40,
      fontSize: textSizes.md,
      paddingVertical: spacing.sm,
      radius: radii.sm,
    },
  };

  const s = sizeMap[size] ?? sizeMap.md;

  // Determine border color priority
  let borderColor = tokens.border;
  if (error) borderColor = tokens.borderError;
  else if (focused) borderColor = tokens.borderFocused;

  return (
    <View style={style}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            height: s.height,
            fontSize: s.fontSize,
            paddingVertical: s.paddingVertical,
            borderRadius: s.radius,
            borderColor,
          },
          inputStyle,
        ]}
        placeholderTextColor={tokens.placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {/* Helper or Error */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  input: {
    backgroundColor: componentTokens.input.bg,
    borderWidth: 1,
    paddingHorizontal: componentTokens.input.paddingHorizontal,
    color: componentTokens.input.text,
  },

  helperText: {
    marginTop: spacing.xs,
    fontSize: textSizes.xs,
    color: colors.textMuted,
  },

  errorText: {
    marginTop: spacing.xs,
    fontSize: textSizes.xs,
    color: colors.danger,
  },
});
