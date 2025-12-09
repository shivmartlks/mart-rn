// src/components/ui/Input.js

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  colors,
  textSizes,
  spacing,
  radius,
  componentTokens,
} from "../../theme";

export default function Input({
  label,
  error = "",
  helper = "",
  style = {},
  inputStyle = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  // Base input token system
  const tokens = componentTokens.input;

  // Determine border color priority
  let borderColor = tokens.border;

  if (error) {
    borderColor = tokens.borderError;
  } else if (focused) {
    borderColor = tokens.borderFocused;
  }

  return (
    <View style={style}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input */}
      <TextInput
        style={[styles.input, { borderColor }, inputStyle]}
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
    height: 48,
    backgroundColor: componentTokens.input.bg,
    borderWidth: 1,
    borderRadius: componentTokens.input.radius,
    paddingHorizontal: componentTokens.input.paddingHorizontal,
    paddingVertical: componentTokens.input.paddingVertical,
    fontSize: textSizes.md,
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
