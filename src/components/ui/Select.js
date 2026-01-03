import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  colors,
  textSizes,
  spacing,
  radii,
  componentTokens,
} from "../../theme";

export default function Select({
  label,
  value,
  onValueChange,
  error = "",
  helper = "",
  size = "md", // sm | md
  style = {},
  pickerStyle = {},
  children,
}) {
  const [focused, setFocused] = useState(false);

  const tokens = componentTokens.input;

  const sizeMap = {
    sm: {
      height: 32,
      fontSize: textSizes.sm,
      radius: radii.sm,
    },
    md: {
      height: 40,
      fontSize: textSizes.md,
      radius: radii.sm,
    },
  };

  const s = sizeMap[size] ?? sizeMap.md;

  let borderColor = tokens.border;
  if (error) borderColor = tokens.borderError;
  else if (focused) borderColor = tokens.borderFocused;

  return (
    <View style={style}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Picker Wrapper */}
      <View
        style={[
          styles.wrapper,
          {
            height: s.height,
            borderRadius: s.radius,
            borderColor,
          },
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={[styles.picker, { fontSize: s.fontSize }, pickerStyle]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {children}
        </Picker>
      </View>

      {/* Helper / Error */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

/* ---------- Option ---------- */
Select.Option = function Option({ label, value }) {
  return <Picker.Item label={label} value={value} />;
};

const styles = StyleSheet.create({
  label: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  wrapper: {
    backgroundColor: componentTokens.input.bg,
    borderWidth: 1,
    justifyContent: "center",
  },

  picker: {
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
