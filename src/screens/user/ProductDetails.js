// src/screens/ProductDetails.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import {
  addToCart,
  removeFromCart,
  getCartCount,
} from "../../services/cartService";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";
import QuantitySelector from "../../components/ui/QuantitySelector";
import Button from "../../components/ui/Button";
import { IMAGES } from "../../const/imageConst";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cacheGet, cacheSet } from "../../services/cache";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetails() {
  const route = useRoute();
  const { user } = useAuth();
  const product = route.params?.product;
  const productKey = product?.id ? `product:${product.id}` : null;
  const cartQtyKey =
    product?.id && user?.id ? `cartqty:${user.id}:${product.id}` : null;
  const [qty, setQty] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const insets = useSafeAreaInsets();
  const FOOTER_HEIGHT = 64; // approx footer CTA height
  const EXTRA_BOTTOM_SPACING = 8; // additional spacing requested

  const images =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : [];

  const isOutOfStock = Number(product?.stock_value) <= 0;
  const limitedQty = Number(product?.stock_value) <= 5 && !isOutOfStock;
  const discountPercent =
    product?.discount_percent ??
    (product?.mrp
      ? Math.max(
          0,
          Math.round(((product.mrp - product.price) / product.mrp) * 100)
        )
      : 0);

  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    // Cache product object for faster re-entry
    if (productKey && product) cacheSet(productKey, product);
  }, [productKey, product]);

  async function fetchQuantity() {
    if (!user || !product?.id) return;

    // Try cache first
    const cachedQty = cartQtyKey ? cacheGet(cartQtyKey) : undefined;
    if (typeof cachedQty === "number") {
      setQty(cachedQty);
      return;
    }

    const { data } = await supabase
      .from("cart_items")
      .select("quantity, products(stock_value)")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();
    const q = data?.quantity || 0;
    setQty(q);
    if (cartQtyKey) cacheSet(cartQtyKey, q, 2 * 60 * 1000); // 2 min TTL
  }

  useEffect(() => {
    fetchQuantity();
  }, [product, user]);

  useEffect(() => {
    async function loadCartCount() {
      if (user) {
        const count = await getCartCount(user.id);
        setCartCount(count);
      }
    }
    loadCartCount();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      async function refresh() {
        if (user) {
          const count = await getCartCount(user.id);
          setCartCount(count);
        }
        fetchQuantity();
      }
      refresh();
    }, [user, product])
  );

  const handleAdd = async () => {
    if (!user) return;
    await addToCart(product.id, user.id);
    // Update qty and cache immediately
    const newQty = qty + 1;
    setQty(newQty);
    if (cartQtyKey) cacheSet(cartQtyKey, newQty, 2 * 60 * 1000);
  };
  const handleRemove = async () => {
    if (qty === 0) return;
    await removeFromCart(product.id, user.id);
    const newQty = Math.max(0, qty - 1);
    setQty(newQty);
    if (cartQtyKey) cacheSet(cartQtyKey, newQty, 2 * 60 * 1000);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FOOTER_HEIGHT + insets.bottom + 140 },
        ]}
      >
        {/* Section 1: Image / Carousel (reduced height) */}
        <View style={styles.carouselWrap}>
          {images.length > 1 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {images.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.productImage} />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={images[0] ? { uri: images[0] } : IMAGES.default}
              style={styles.productImage}
            />
          )}
        </View>

        {/* Section 2: Product name, price, discount, stock/qty alerts */}
        <View style={styles.detailsBox}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp ? (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            ) : null}
            {discountPercent > 0 ? (
              <Text style={styles.discountTag}>{discountPercent}% OFF</Text>
            ) : null}
          </View>

          {limitedQty ? (
            <Text style={styles.limited}>
              Limited stock: only {product.stock_value} left
            </Text>
          ) : null}
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>Out of stock</Text>
          ) : null}

          {product.short_desc ? (
            <Text style={styles.short}>{product.short_desc}</Text>
          ) : null}
        </View>

        {/* Section 3: Benefits row (static) */}
        <View style={styles.benefitsRow}>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitTitle}>Fast Delivery</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <Text style={styles.benefitTitle}>Customer Support</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>💵</Text>
            <Text style={styles.benefitTitle}>Cash on Delivery</Text>
          </View>
        </View>

        {/* Section 4: Highlights (Name-Value list in Card) */}
        {Array.isArray(product?.highlights) && product.highlights.length > 0 ? (
          <View style={styles.cardBox}>
            <Text style={styles.cardTitle}>Highlights</Text>
            {product.highlights.map((h, idx) => (
              <View key={idx} style={styles.nvRow}>
                <Text style={styles.nvName}>{h.name}</Text>
                <Text style={styles.nvValue}>{h.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Section 5: More Info (collapsible) */}
        {Array.isArray(product?.more_info) && product.more_info.length > 0 ? (
          <View style={styles.cardBox}>
            <TouchableOpacity onPress={() => setShowMoreInfo((s) => !s)}>
              <Text style={styles.cardTitle}>
                More Info {showMoreInfo ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {showMoreInfo && (
              <View>
                {product.more_info.map((m, idx) => (
                  <View key={idx} style={styles.nvRow}>
                    <Text style={styles.nvName}>{m.name}</Text>
                    <Text style={styles.nvValue}>{m.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* About section preserved below more info */}
        {product.description ? (
          <View style={styles.cardBox}>
            <Text style={styles.cardTitle}>About this item</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating cart button placed above footer CTA */}
      {cartCount > 0 && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom:
              insets.bottom + FOOTER_HEIGHT + spacing.sm + EXTRA_BOTTOM_SPACING,
            zIndex: 10,
          }}
        >
          <Button
            onPress={() => navigation.navigate("UserTabs", { screen: "Cart" })}
            style={{
              alignSelf: "flex-end",
              marginRight: spacing.lg,
              backgroundColor: colors.primary,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: 28,
              elevation: 6,
            }}
          >
            {`${cartCount} items in Cart`}
          </Button>
        </View>
      )}

      {/* Sticky footer Add to Cart CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.footerWrapper}>
        <View
          style={[
            styles.footerInner,
            {
              // Match ManageAddresses footer spacing exactly
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: spacing.sm,
              minHeight: FOOTER_HEIGHT,
            },
          ]}
        >
          <Button
            block
            onPress={handleAdd}
            disabled={isOutOfStock || qty >= product.stock_value}
          >
            Add to Cart
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBG },
  scrollContent: { paddingBottom: 220 },
  carouselWrap: { width: "100%", backgroundColor: colors.cardSoft },
  productImage: {
    width: "100%",
    height: 240,
    backgroundColor: colors.cardSoft,
  },
  detailsBox: { padding: spacing.lg },
  name: {
    fontSize: textSizes.lg,
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
    gap: 8,
    marginTop: spacing.xs,
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
  },
  discountTag: {
    marginLeft: spacing.xs,
    color: colors.success,
    fontWeight: fontWeights.semibold,
  },
  limited: { color: colors.warning, marginTop: spacing.xs },
  outOfStock: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: fontWeights.semibold,
  },

  benefitsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: colors.cardBG,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitIcon: { fontSize: 18, marginBottom: 6 },
  benefitTitle: {
    color: colors.textPrimary,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.medium,
  },

  cardBox: {
    backgroundColor: colors.cardBG,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  nvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  nvName: { color: colors.textSecondary, fontSize: textSizes.sm },
  nvValue: {
    color: colors.textPrimary,
    fontSize: textSizes.sm,
    maxWidth: "60%",
    textAlign: "right",
  },

  description: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  floatingCartWrap: {
    position: "absolute",
    right: spacing.lg,
    bottom: 92,
    backgroundColor: colors.cardBG,
    padding: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },

  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.cardBG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
