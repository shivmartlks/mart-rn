import React, { memo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import QuantitySelector from "../../../components/ui/QuantitySelector";
import Badge from "../../../components/ui/Badge";
import DefaultProduct from "../../../../assets/default_product.svg";
import { colors, spacing, textSizes, radii, fontWeights } from "../../../theme";

function ProductCard({
  product,
  qty = 0,
  onIncrease,
  onDecrease,
  onPress,
  showQuantityControls = false,
  showStockOverlays = false,
  style,
}) {
  if (!product) return null;
  const mrp = product.mrp || product.price;
  const discount = mrp ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const isValidImage =
    typeof product.image_url === "string" &&
    product.image_url.startsWith("http");
  const stockValue = Number(product._stock_value ?? 0);
  const isOutOfStock = stockValue <= 0;
  const isLowStock = stockValue < 5 && stockValue > 0;
  const disableInc = stockValue > 0 ? qty >= stockValue : false;

  return (
    <View
      style={[
        styles.productCard,
        isOutOfStock && styles.productCardOutOfStock,
        style,
      ]}
    >
      <Pressable style={styles.imageWrapper} onPress={onPress}>
        {isValidImage ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imageFallbackCenter}>
            <DefaultProduct width={120} height={120} />
          </View>
        )}

        {showStockOverlays && isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {showQuantityControls && !isOutOfStock && (
          <QuantitySelector
            value={qty}
            variant="advanced"
            mode="filled"
            size="sm"
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            style={styles.floatingControl}
            disableIncrease={disableInc}
          />
        )}
      </Pressable>

      <Pressable onPress={onPress}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.shortDesc} numberOfLines={1}>
          {product.short_desc || ""}
        </Text>
      </Pressable>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        <Text style={styles.mrp}>₹{mrp}</Text>
        {discount > 0 && (
          <Badge
            size="sm"
            variant="success"
            label={`${discount}% OFF`}
            style={styles.discountBadge}
          />
        )}
      </View>

      {isLowStock && !isOutOfStock && (
        <Text style={styles.lowStockWarning}>Hurry, only few left</Text>
      )}
    </View>
  );
}

function areEqual(prev, next) {
  const p = prev.product || {};
  const n = next.product || {};
  return (
    prev.qty === next.qty &&
    p.id === n.id &&
    p.price === n.price &&
    p.mrp === n.mrp &&
    p._stock_value === n._stock_value &&
    p.image_url === n.image_url &&
    prev.showQuantityControls === next.showQuantityControls &&
    prev.showStockOverlays === next.showStockOverlays &&
    prev.style === next.style
  );
}

export default memo(ProductCard, areEqual);

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: colors.cardSoft,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexBasis: "48%",
    maxWidth: "48%",
  },
  productCardOutOfStock: { opacity: 0.5 },
  imageWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: "hidden",
    padding: spacing.sm,
    backgroundColor: colors.white200,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    height: 120,
    width: "100%",
  },
  imageFallbackCenter: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: { width: "100%", height: "100%" },
  floatingControl: { position: "absolute", bottom: 8, right: 8 },
  productName: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  shortDesc: {
    fontSize: textSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  discountBadge: { marginLeft: spacing.xs },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  price: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  mrp: {
    fontSize: textSizes.sm,
    textDecorationLine: "line-through",
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  lowStockWarning: {
    color: colors.warning,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
  },
  outOfStockOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    height: 32,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
  },
  outOfStockText: {
    color: colors.white50,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.bold,
  },
});
