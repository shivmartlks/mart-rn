// // src/components/ui/Button.js

// import React from "react";
// import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
// import { colors, textSizes, spacing, componentTokens } from "../../theme";

// export default function Button({
//   children,
//   size = "md", // md | lg | sm
//   variant = "primary", // primary | secondary | ghost | link
//   block = false,
//   loading = false,
//   disabled = false,
//   rightIcon = null,
//   style = {},
//   textStyle = {},
//   ...props
// }) {
//   // ---------------------------------------
//   // RESOLVE SIZE
//   // ---------------------------------------
//   const sizeMap = {
//     sm: {
//       height: componentTokens.button.heightMd - 10, // ~38 px
//       fontSize: textSizes.sm,
//       paddingVertical: spacing.xs,
//     },
//     md: {
//       height: componentTokens.button.heightMd, // 48px
//       fontSize: textSizes.md,
//       paddingVertical: spacing.sm,
//     },
//     lg: {
//       height: componentTokens.button.heightLg, // 52px
//       fontSize: textSizes.lg,
//       paddingVertical: spacing.md,
//     },
//   };

//   const currentSize = sizeMap[size];

//   // ---------------------------------------
//   // RESOLVE VARIANT (Using Design Tokens)
//   // ---------------------------------------
//   const btn = componentTokens.button;

//   const variantMap = {
//     primary: {
//       backgroundColor: btn.primaryBg,
//       textColor: btn.primaryText,
//       borderColor: "transparent",
//     },
//     secondary: {
//       backgroundColor: btn.secondaryBg,
//       textColor: btn.secondaryText,
//       borderColor: btn.secondaryBorder,
//     },
//     ghost: {
//       backgroundColor: "transparent",
//       textColor: colors.textPrimary,
//       borderColor: "transparent",
//     },
//     link: {
//       backgroundColor: "transparent",
//       textColor: colors.blue600,
//       borderColor: "transparent",
//     },
//   };

//   const currentVariant = variantMap[variant];

//   // ---------------------------------------
//   // RESOLVE DISABLED STATE
//   // ---------------------------------------
//   const disabledMap = disabled
//     ? {
//         backgroundColor: btn.disabledBg,
//         textColor: btn.disabledText,
//         borderColor: "transparent",
//       }
//     : {};

//   const backgroundColor =
//     disabledMap.backgroundColor || currentVariant.backgroundColor;

//   const borderColor = disabledMap.borderColor || currentVariant.borderColor;

//   const textColor = disabledMap.textColor || currentVariant.textColor;

//   // ---------------------------------------
//   // RENDER
//   // ---------------------------------------
//   return (
//     <TouchableOpacity
//       activeOpacity={disabled ? 1 : 0.7}
//       disabled={disabled}
//       {...props}
//       style={[
//         {
//           backgroundColor,
//           borderColor,
//           borderWidth: borderColor === "transparent" ? 0 : 1,
//           borderRadius: btn.radius,
//           paddingHorizontal: variant === "link" ? 0 : spacing.lg,
//           width: block ? "100%" : undefined,
//           minHeight: currentSize.height,
//           justifyContent: "center",
//           alignItems: "center",
//           flexDirection: "row",
//           gap: 8,
//           paddingVertical: currentSize.paddingVertical,
//         },
//         style,
//       ]}
//     >
//       {/* TEXT */}
//       {!loading && (
//         <Text
//           style={[
//             {
//               color: textColor,
//               fontSize: currentSize.fontSize,
//               fontWeight: "500",
//             },
//             textStyle,
//           ]}
//         >
//           {children}
//         </Text>
//       )}

//       {/* LOADING SPINNER */}
//       {loading && (
//         <ActivityIndicator
//           size="small"
//           color={textColor}
//           style={{ marginLeft: 8 }}
//         />
//       )}

//       {/* RIGHT ICON */}
//       {!loading && rightIcon && (
//         <View style={{ marginLeft: 4 }}>{rightIcon}</View>
//       )}
//     </TouchableOpacity>
//   );
// }

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, textSizes, radius } from "../../theme/theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? colors.textPrimary : colors.cardBG}
          style={{ marginRight: 8 }}
        />
      )}

      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.secondaryText,
          isDisabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },

  // Primary button (dark)
  primary: {
    backgroundColor: colors.primary,
  },

  // Secondary (white + border)
  secondary: {
    backgroundColor: colors.cardBG,
    borderWidth: 1,
    borderColor: colors.border,
  },

  text: {
    fontSize: textSizes.md,
    color: colors.cardBG, // white text for primary
    fontWeight: "600",
  },

  secondaryText: {
    color: colors.textPrimary,
  },

  disabled: {
    backgroundColor: colors.border,
  },

  disabledText: {
    color: colors.textMuted,
  },
});
