// src/components/ui/QuantitySelector.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { colors, spacing, textSizes, radii, fontWeights } from "../../theme";

/**
 Props:
  - value (number)
  - onIncrease, onDecrease
  - variant: "default" | "advanced" | "bottom"
  - mode: "outline" | "filled"   // appearance
  - size: "sm" | "md"
  - style: container style (use width: '100%' for full width bottom)
  - addLabel: string for ADD/Add to Cart
  - disabled, fontSize, borderColor, bg, iconColor, radius (overrides accepted)
*/

const sizeMap = {
  sm: {
    height: 32,
    iconSize: 14,
    valueSize: textSizes.sm,
    padH: spacing.lg,
    padV: spacing.xs,
    borderRadius: radii.full,
  },
  md: {
    height: 40,
    iconSize: 18,
    valueSize: textSizes.md,
    padH: spacing.lg,
    padV: spacing.sm,
    borderRadius: radii.full,
  },
};

function resolve(tokenOrHex, fallback) {
  if (!tokenOrHex) return fallback;
  // theme colors keyed strings are handled at usage sites; allow hex passthrough
  return tokenOrHex;
}

// Removed toast logic and ensured `disableIncrease` is respected
export default function QuantitySelector({
  value = 0,
  onIncrease = () => {},
  onDecrease = () => {},
  variant = "default",
  mode = "filled",
  size = "md",
  style = {},
  addLabel = "Add",
  disabled = false,
  disableIncrease = false, // Added prop to disable the + button
  borderColor: borderColorProp = null,
  bg: bgProp = null,
  iconColor: iconColorProp = null,
  fontSize: fontSizeProp = null,
  radius: radiusOverride = null,
}) {
  const s = sizeMap[size] || sizeMap.md;
  const wantsFullWidth = style?.width === "100%" || style?.flex === 1;

  // Determine appearance defaults
  const defaultOutlineBg = resolve(bgProp, colors.white50);
  const defaultOutlineBorder = resolve(borderColorProp, colors.black800);
  const defaultOutlineIcon = resolve(iconColorProp, colors.black800);

  const defaultFilledBg = resolve(bgProp, colors.black800);
  const defaultFilledIcon = resolve(iconColorProp, colors.white50);
  const defaultFilledBorder = resolve(borderColorProp, defaultFilledBg);

  const appearance =
    mode === "filled"
      ? {
          bg: defaultFilledBg,
          border: defaultFilledBorder,
          icon: defaultFilledIcon,
        }
      : {
          bg: defaultOutlineBg,
          border: defaultOutlineBorder,
          icon: defaultOutlineIcon,
        };

  // If bottom + full width and mode not explicitly set, use filled by default
  const finalMode =
    mode || (variant === "bottom" && wantsFullWidth ? "filled" : "outline");
  const finalAppearance =
    finalMode === "filled"
      ? {
          bg: defaultFilledBg,
          border: defaultFilledBorder,
          icon: defaultFilledIcon,
        }
      : appearance;

  const finalBg = disabled ? colors.gray200 : finalAppearance.bg;
  const finalBorder = disabled ? colors.gray200 : finalAppearance.border;
  const finalIcon = disabled ? colors.textMuted : finalAppearance.icon;
  const finalRadius = radiusOverride ?? s.borderRadius;
  const finalFontSize = fontSizeProp ?? s.valueSize;

  const showAdd = variant === "advanced" && (!value || value === 0);

  const Icon = ({ children }) => (
    <Text style={{ fontWeight: "700", color: finalIcon, fontSize: s.iconSize }}>
      {children}
    </Text>
  );

  // Add pill (inline)
  if (showAdd && variant === "advanced") {
    return (
      <TouchableOpacity
        onPress={onIncrease}
        disabled={disabled}
        activeOpacity={0.85}
        style={[
          {
            backgroundColor: finalBg,
            borderColor: finalBorder,
            borderWidth: 1,
            borderRadius: finalRadius,
            paddingHorizontal: s.padH,
            paddingVertical: s.padV,
            alignSelf: style.alignSelf || "flex-start",
            height: s.height,
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text
          style={{
            color: finalIcon,
            fontSize: finalFontSize,
            fontWeight: fontWeights?.medium ?? "700",
          }}
        >
          {String(addLabel).toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  }

  // Helper: three-column layout with equal widths and full-height touch areas
  const ThreePart = ({ left, middle, right, fullWidth = false }) => {
    return (
      <View
        style={[
          {
            // Use full width when explicitly requested, otherwise allow auto width
            width: fullWidth ? "100%" : "auto",
            // Ensure there is always enough width so the three columns are tappable.
            // Using s.height * 3 keeps proportions sensible for sm/md.
            minWidth: s.height * 3,
            height: s.height,
            minHeight: s.height,
            borderRadius: finalRadius,
            borderWidth: 1,
            borderColor: finalBorder,
            backgroundColor: finalBg,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",

            // Prevent collapse when absolutely positioned by asking to size to content
            alignSelf: "flex-start",
          },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onDecrease}
          disabled={value <= 0 || disabled}
          activeOpacity={0.7}
          style={{
            flex: 1,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {left}
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {middle}
        </View>

        <TouchableOpacity
          onPress={onIncrease}
          disabled={disableIncrease || disabled} // Disable + button if `disableIncrease` is true
          activeOpacity={0.7}
          style={{
            flex: 1,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {right}
        </TouchableOpacity>
      </View>
    );
  };

  // Bottom variant handling (full width optional)
  if (variant === "bottom") {
    if (!value || value === 0) {
      if (wantsFullWidth) {
        return (
          <TouchableOpacity
            onPress={onIncrease}
            disabled={disabled}
            activeOpacity={0.85}
            style={[
              {
                backgroundColor: finalBg,
                borderColor: finalBorder,
                borderWidth: 1,
                borderRadius: finalRadius,
                height: s.height,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              },
              style,
            ]}
          >
            <Text
              style={{
                color: finalIcon,
                fontSize: finalFontSize,
                fontWeight: "700",
              }}
            >
              {addLabel}
            </Text>
          </TouchableOpacity>
        );
      } else {
        // inline add pill centered by consumer
        return (
          <TouchableOpacity
            onPress={onIncrease}
            disabled={disabled}
            activeOpacity={0.85}
            style={[
              {
                backgroundColor: finalBg,
                borderColor: finalBorder,
                borderWidth: 1,
                borderRadius: finalRadius,
                paddingHorizontal: s.padH,
                paddingVertical: s.padV,
                height: s.height,
                justifyContent: "center",
              },
              style,
            ]}
          >
            <Text
              style={{
                color: finalIcon,
                fontSize: finalFontSize,
                fontWeight: "700",
              }}
            >
              {addLabel}
            </Text>
          </TouchableOpacity>
        );
      }
    } else {
      // bottom selector (full width or inline)
      if (wantsFullWidth) {
        return (
          <ThreePart
            fullWidth
            left={<Icon>−</Icon>}
            middle={
              <Text
                style={{
                  color: finalIcon,
                  fontSize: finalFontSize,
                  fontWeight: "700",
                }}
              >
                {value}
              </Text>
            }
            right={<Icon>+</Icon>}
          />
        );
      } else {
        return (
          <ThreePart
            left={<Icon>−</Icon>}
            middle={
              <Text
                style={{
                  color: finalIcon,
                  fontSize: finalFontSize,
                  fontWeight: "700",
                }}
              >
                {value}
              </Text>
            }
            right={<Icon>+</Icon>}
          />
        );
      }
    }
  }

  // default inline selector (outline by default) - now with equal touch areas
  return (
    <ThreePart
      left={<Icon>−</Icon>}
      middle={
        <Text
          style={{
            color: finalIcon,
            fontSize: finalFontSize,
            fontWeight: "700",
          }}
        >
          {value}
        </Text>
      }
      right={<Icon>+</Icon>}
    />
  );
}
