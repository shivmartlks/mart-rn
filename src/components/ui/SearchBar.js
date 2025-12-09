// src/components/ui/SearchBar.js

import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radius, textSizes } from "../../theme";
import { Feather } from "@expo/vector-icons";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear = null,
  style = {},
  autoFocus = false,
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Search Icon */}
      <Feather name="search" size={18} color={colors.textSecondary} />

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />

      {/* Clear Button */}
      {value?.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText("");
            onClear && onClear();
          }}
        >
          <Feather name="x-circle" size={18} color={colors.gray500} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: textSizes.md,
    color: colors.textPrimary,
  },
});
