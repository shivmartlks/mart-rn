import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { colors, textSizes, radius } from "../../Theme/theme";

export default function Button({
  children,
  size = "medium",
  variant = "default",
  block = false,
  loading = false,
  disabled = false,
  rightIcon = null,
  style = {},
  textStyle = {},
  ...props
}) {
  // -------------------------------
  // SIZE
  // -------------------------------
  const sizeStyles = {
    small: {
      paddingVertical: 6,
      minHeight: 32,
      fontSize: textSizes[12],
    },
    medium: {
      paddingVertical: 8,
      minHeight: 40,
      fontSize: textSizes[14],
    },
    large: {
      paddingVertical: 12,
      minHeight: 48,
      fontSize: textSizes[16],
    },
  };

  // -------------------------------
  // VARIANTS
  // -------------------------------
  const variantStyles = {
    default: {
      backgroundColor: colors.black800,
      textColor: colors.white50,
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: "transparent",
      borderColor: colors.black800,
      textColor: colors.black800,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: colors.black900,
    },
    link: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: colors.blue600,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  // -------------------------------
  // DISABLED STYLES
  // -------------------------------
  const disabledStyle = disabled
    ? {
        backgroundColor: colors.gray100,
        borderColor: colors.gray200,
        textColor: colors.gray500,
      }
    : {};

  const bgColor =
    disabledStyle.backgroundColor || currentVariant.backgroundColor;

  const borderColor = disabledStyle.borderColor || currentVariant.borderColor;

  const txtColor = disabledStyle.textColor || currentVariant.textColor;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
      {...props}
      style={[
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: borderColor === "transparent" ? 0 : 1,
          borderRadius: radius.base,
          paddingHorizontal: variant === "link" ? 0 : 16,
          width: block ? "100%" : undefined,
          minHeight: currentSize.minHeight,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 8,
        },
        style,
      ]}
    >
      {/* Text */}
      {!loading && (
        <Text
          style={[
            {
              color: txtColor,
              fontSize: currentSize.fontSize,
              fontWeight: "500",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}

      {/* Loader */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={txtColor}
          style={{ marginLeft: 8 }}
        />
      )}

      {/* Right icon, only visible if not loading */}
      {!loading && rightIcon && (
        <View style={{ marginLeft: 4 }}>{rightIcon}</View>
      )}
    </TouchableOpacity>
  );
}
