// src/components/ui/ImageCard.js

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, spacing, radii, textSizes, shadows } from "../../theme";
import Badge from "./Badge";
import Button from "./Button";

// STOCK STATUS MAPPING
const stockStyles = {
  in: {
    label: "In Stock",
    bg: colors.green50,
    border: colors.green200,
    text: colors.green700,
  },
  low: {
    label: "Low Stock",
    bg: colors.orange50,
    border: colors.orange200,
    text: colors.orange700,
  },
  out: {
    label: "Out of Stock",
    bg: colors.red50,
    border: colors.red200,
    text: colors.red700,
  },
};

export default function ImageCard({
  title,
  price,
  image,
  onPress,
  discount = null, // optional number like 20 (means -20%)
  badge = null, // optional badge label
  showAddButton = false,
  style = {},
}) {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, shadows.card, style]}
    >
      {/* Image Container */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          onLoadEnd={() => setLoading(false)}
        />

        {/* Loader */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.gray600}
            style={styles.loadingIndicator}
          />
        )}

        {/* Badge (e.g. NEW, HOT, SALE) */}
        {badge && (
          <View style={styles.badgeContainer}>
            <Badge label={badge} size="sm" />
          </View>
        )}

        {/* Discount */}
        {discount && (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Price */}
        <Text style={styles.price}>₹{price}</Text>

        {/* Add to Cart button */}
        {showAddButton && (
          <Button
            size="small"
            style={{ marginTop: spacing.sm }}
            onPress={onPress}
          >
            Add to Cart
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBG,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },

  imageWrapper: {
    width: "100%",
    height: 160,
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  loadingIndicator: {
    position: "absolute",
  },

  badgeContainer: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
  },

  discountTag: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.red500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },

  discountText: {
    fontSize: textSizes.xs,
    color: colors.white50,
    fontWeight: "600",
  },

  content: {
    padding: spacing.md,
  },

  title: {
    fontSize: textSizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    height: 36, // consistent height for grid
  },

  price: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
