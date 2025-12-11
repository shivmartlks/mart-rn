// src/screens/ProductDetails.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { addToCart, removeFromCart } from "../../services/cartService";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";
import QuantitySelector from "../../components/ui/QuantitySelector";
import { IMAGES } from "../../const/imageConst";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductDetails() {
  const route = useRoute();
  const { user } = useAuth();
  const product = route.params?.product;
  const [qty, setQty] = useState(0);
  const insets = useSafeAreaInsets();

  async function fetchQuantity() {
    if (!user || !product?.id) return;
    const { data } = await supabase
      .from("cart_items")
      .select("quantity, products(stock_value)")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();
    setQty(data?.quantity || 0);
  }

  useEffect(() => {
    fetchQuantity();
  }, [product, user]);
  useFocusEffect(
    useCallback(() => {
      fetchQuantity();
    }, [product, user])
  );

  const handleAdd = async () => {
    if (!user) return;
    await addToCart(product.id, user.id);
    fetchQuantity();
  };
  const handleRemove = async () => {
    if (qty === 0) return;
    await removeFromCart(product.id, user.id);
    fetchQuantity();
  };

  const isValidImage = product?.image_url?.startsWith?.("http");

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={isValidImage ? { uri: product.image_url } : IMAGES.default}
          style={styles.productImage}
        />
        <View style={styles.detailsBox}>
          <Text style={styles.name}>{product.name}</Text>
          {product.short_desc ? (
            <Text style={styles.short}>{product.short_desc}</Text>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp ? (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            ) : null}
          </View>
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.description}>
            {product.description || "No description available."}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerWrapper,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.footerInner}>
          {/* Inline centered default outline CTA (size md = 40). To make full-width filled CTA use style={{ width: '100%' }} and mode="filled" */}
          <QuantitySelector
            value={qty}
            variant="bottom"
            size="md"
            addLabel="Add to Cart"
            onIncrease={handleAdd}
            onDecrease={handleRemove}
            disableIncrease={qty >= product.stock_value} // Disable + button if stock is exceeded
            style={{ alignSelf: "center", width: 120 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 160 },
  productImage: {
    width: "100%",
    height: 300,
    backgroundColor: colors.cardSoft,
  },
  detailsBox: { padding: spacing.lg },
  name: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  short: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  price: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  mrp: {
    fontSize: textSizes.md,
    textDecorationLine: "line-through",
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  description: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  footerInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
  },
});
