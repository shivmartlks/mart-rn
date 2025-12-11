// src/components/ui/Avatar.js

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, textSizes, spacing, radii } from "../../theme";

export default function Avatar({
  size = "md", // sm | md | lg | xl
  source = null, // image URL
  name = "", // fallback initials
  rounded = true, // full circular
  border = false, // optional border
  status = null, // "online" | "offline" | null
  onPress = null,
  style = {},
  textStyle = {},
}) {
  // -------------------------
  // SIZE MAP
  // -------------------------
  const sizeMap = {
    sm: { dimension: 32, fontSize: textSizes.sm },
    md: { dimension: 44, fontSize: textSizes.md },
    lg: { dimension: 60, fontSize: textSizes.lg },
    xl: { dimension: 80, fontSize: textSizes.xl },
  };

  const s = sizeMap[size];

  const Wrapper = onPress ? TouchableOpacity : View;

  // -------------------------
  // INITIALS FALLBACK
  // -------------------------
  const getInitials = () => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    let initials = parts[0]?.charAt(0).toUpperCase();
    if (parts.length > 1) {
      initials += parts[1]?.charAt(0).toUpperCase();
    }
    return initials;
  };

  const initials = getInitials();

  return (
    <Wrapper
      onPress={onPress}
      style={[
        {
          width: s.dimension,
          height: s.dimension,
          borderRadius: rounded ? s.dimension / 2 : radii.md,
          backgroundColor: colors.gray200,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          borderWidth: border ? 2 : 0,
          borderColor: colors.white50,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      {/* IMAGE */}
      {source ? (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: rounded ? s.dimension / 2 : radii.md,
          }}
        />
      ) : (
        /* INITIALS */
        <Text
          style={[
            {
              fontSize: s.fontSize,
              color: colors.textPrimary,
              fontWeight: "600",
            },
            textStyle,
          ]}
        >
          {initials}
        </Text>
      )}

      {/* STATUS DOT */}
      {status && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                status === "online" ? colors.success : colors.gray400,
              borderColor: colors.white50,
              width: s.dimension * 0.25,
              height: s.dimension * 0.25,
              borderRadius: (s.dimension * 0.25) / 2,
            },
          ]}
        />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
  },
});
