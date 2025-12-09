// src/components/ui/FormRow.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, textSizes } from "../../theme";

export default function FormRow({
  label,
  children,
  required = false,
  style = {},
  labelStyle = {},
}) {
  return (
    <View style={[styles.row, style]}>
      {/* Label */}
      <Text style={[styles.label, labelStyle]}>
        {label}
        {required && <Text style={{ color: colors.danger }}> *</Text>}
      </Text>

      {/* Input Component */}
      <View style={styles.inputWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: textSizes.sm,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "column",
  },
});
