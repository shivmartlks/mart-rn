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
import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import {
  addToCart,
  removeFromCart,
  getCartCount,
} from "../../services/cartService";
import { supabase, SUPABASE_URL } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";
import QuantitySelector from "../../components/ui/QuantitySelector";
import Button from "../../components/ui/Button";
import { IMAGES } from "../../const/imageConst";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cacheGet, cacheSet } from "../../services/cache";
import { cacheClear } from "../../services/cache";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProductWithAttributes } from "../../services/adminApi";
import { useWindowDimensions } from "react-native";

export default function ProductDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const productParam = route.params?.product;
  const productId = productParam?.id;
  const productKey = productId ? `product:${productId}` : null;
  const cartQtyKey =
    productId && user?.id ? `cartqty:${user.id}:${productId}` : null;
  const [viewProduct, setViewProduct] = useState(productParam || null);
  const [qty, setQty] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const insets = useSafeAreaInsets();
  const FOOTER_HEIGHT = 64; // approx footer CTA height
  const EXTRA_BOTTOM_SPACING = 8; // additional spacing requested
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  function normalizeImageUrl(u) {
    if (!u) return "";
    const x = String(u).trim();
    if (x.startsWith("https://") || x.startsWith("http://")) return x;
    if (x.startsWith("/")) return `${SUPABASE_URL}${x}`;
    if (x.startsWith("storage/v1/object/public")) return `${SUPABASE_URL}/${x}`;
    if (x.startsWith("public/"))
      return `${SUPABASE_URL}/storage/v1/object/${x}`;
    return x;
  }

  function normalizeAttributes(rows) {
    const res = { highlights: [], specs: [], description: "", nutrition: "" };
    if (!Array.isArray(rows)) return res;
    rows.forEach((r) => {
      const g = r?.group_key;
      const key = String(r?.key ?? "").trim();
      const val = String(r?.value ?? "").trim();
      if (!g) return;
      if (g === "highlights") {
        if (val) res.highlights.push(val);
      } else if (g === "details") {
        if (key && val) res.specs.push({ name: key, value: val });
      } else if (g === "description") {
        if (val) res.description = val;
      } else if (g === "nutrition") {
        if (val) res.nutrition = val;
      }
    });
    return res;
  }

  useEffect(() => {
    async function init() {
      if (!productId) return;
      const cached = productKey ? cacheGet(productKey) : null;
      if (cached) {
        setViewProduct(cached);
        return;
      }
      // Fetch only core product and images
      const [prodRes, imgRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).maybeSingle(),
        supabase
          .from("product_images")
          .select("image_url, sort_order")
          .eq("product_id", productId)
          .order("sort_order"),
      ]);
      if (prodRes.error || !prodRes.data) return;
      const product = prodRes.data;
      const images = Array.isArray(imgRes?.data)
        ? imgRes.data
            .map((i) => ({ uri: normalizeImageUrl(i.image_url) }))
            .filter((o) => !!o.uri)
        : [];
      // Fetch inventory from store_inventory
      const { data: inv } = await supabase
        .from("store_inventory")
        .select("stock_value")
        .eq("product_id", productId)
        .maybeSingle();
      const finalProduct = {
        ...product,
        images,
        _stock_value: inv?.stock_value ?? 0,
      };
      setViewProduct(finalProduct);
      if (productKey) cacheSet(productKey, finalProduct);
    }
    init();
  }, [productId]);

  async function loadAttributesIfNeeded() {
    if (!productId) return;
    const already = viewProduct?.attributes;
    if (
      already &&
      (already.highlights?.length ||
        already.specs?.length ||
        already.description ||
        already.nutrition)
    ) {
      return;
    }
    const cached = productKey ? cacheGet(productKey) : null;
    if (cached?.attributes) {
      setViewProduct((p) => ({ ...(p || {}), attributes: cached.attributes }));
      return;
    }
    setAttributesLoading(true);
    const { data, error } = await supabase
      .from("product_attributes")
      .select("key, value, group_key")
      .eq("product_id", productId);
    const attrs = normalizeAttributes(error ? [] : data);
    setViewProduct((p) => {
      const merged = { ...(p || {}), attributes: attrs };
      if (productKey)
        cacheSet(productKey, { ...(cached || p || {}), attributes: attrs });
      return merged;
    });
    setAttributesLoading(false);
  }

  async function fetchQuantity() {
    if (!user || !productId) return;
    const cachedQty = cartQtyKey ? cacheGet(cartQtyKey) : undefined;
    if (typeof cachedQty === "number") {
      setQty(cachedQty);
      return;
    }
    const { data } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    const q = data?.quantity || 0;
    setQty(q);
    if (cartQtyKey) cacheSet(cartQtyKey, q, 2 * 60 * 1000);
  }

  useEffect(() => {
    fetchQuantity();
  }, [productId, user]);

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
    }, [user, productId])
  );

  const handleAdd = async () => {
    if (!user) return;
    await addToCart(productId, user.id);
    // Update qty and cache immediately
    const newQty = qty + 1;
    setQty(newQty);
    if (cartQtyKey) cacheSet(cartQtyKey, newQty, 2 * 60 * 1000);
    // Invalidate cart cache and refresh count
    if (user?.id) cacheClear(`cart:${user.id}`);
    if (user?.id) {
      const count = await getCartCount(user.id);
      setCartCount(count);
    }
  };
  const handleRemove = async () => {
    if (qty === 0) return;
    await removeFromCart(productId, user.id);
    const newQty = Math.max(0, qty - 1);
    setQty(newQty);
    if (cartQtyKey) cacheSet(cartQtyKey, newQty, 2 * 60 * 1000);
    // Invalidate cart cache and refresh count
    if (user?.id) cacheClear(`cart:${user.id}`);
    if (user?.id) {
      const count = await getCartCount(user.id);
      setCartCount(count);
    }
  };

  const images = Array.isArray(viewProduct?.images) ? viewProduct.images : [];
  const attrs = viewProduct?.attributes;

  const isOutOfStock = Number(viewProduct?._stock_value ?? 0) <= 0;
  const limitedQty =
    Number(viewProduct?._stock_value ?? 0) <= 5 && !isOutOfStock;
  const discountPercent =
    viewProduct?.discount_percent ??
    (viewProduct?.mrp
      ? Math.max(
          0,
          Math.round(
            ((viewProduct.mrp - viewProduct.price) / viewProduct.mrp) * 100
          )
        )
      : 0);

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
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width: screenWidth }}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const w =
                    e.nativeEvent.layoutMeasurement.width || screenWidth;
                  const idx = Math.round(x / Math.max(1, w));
                  if (idx !== activeImageIdx) setActiveImageIdx(idx);
                }}
                scrollEventThrottle={16}
              >
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img.uri }}
                    style={[styles.productImage, { width: screenWidth }]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.pagerDotsWrap}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.pagerDot,
                      i === activeImageIdx ? styles.pagerDotActive : null,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <Image
              source={images[0]?.uri ? { uri: images[0].uri } : IMAGES.default}
              style={[styles.productImage, { width: screenWidth }]}
            />
          )}
        </View>

        {/* Section 2: Product name, price, discount, stock/qty alerts */}
        <View style={styles.detailsBox}>
          <Text style={styles.name}>{viewProduct?.name || ""}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{viewProduct?.price ?? "--"}</Text>
            {viewProduct?.mrp ? (
              <Text style={styles.mrp}>₹{viewProduct.mrp}</Text>
            ) : null}
            {discountPercent > 0 ? (
              <Text style={styles.discountTag}>{discountPercent}% OFF</Text>
            ) : null}
          </View>

          {limitedQty ? (
            <Text style={styles.limited}>
              Limited stock: only {viewProduct?._stock_value} left
            </Text>
          ) : null}
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>Out of stock</Text>
          ) : null}

          {viewProduct?.short_desc ? (
            <Text style={styles.short}>{viewProduct.short_desc}</Text>
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

        {/* More product details toggle */}
        <View style={styles.cardBox}>
          {!showMoreInfo ? (
            <Button
              onPress={async () => {
                await loadAttributesIfNeeded();
                setShowMoreInfo(true);
              }}
            >
              More product details
            </Button>
          ) : (
            <>
              {attributesLoading && (
                <Text style={{ color: colors.textSecondary }}>
                  Loading details...
                </Text>
              )}
              {!attributesLoading && (
                <View>
                  {/* Highlights (bulleted) */}
                  {Array.isArray(attrs?.highlights) &&
                    attrs.highlights.length > 0 && (
                      <View style={{ marginBottom: spacing.md }}>
                        <Text style={styles.cardTitle}>Highlights</Text>
                        {attrs.highlights.map((h, idx) => (
                          <Text
                            key={idx}
                            style={{
                              color: colors.textPrimary,
                              marginVertical: 2,
                            }}
                          >
                            {"\u2022 "}
                            {h}
                          </Text>
                        ))}
                      </View>
                    )}

                  {/* Specifications (key/value) */}
                  {Array.isArray(attrs?.specs) && attrs.specs.length > 0 && (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={styles.cardTitle}>Specifications</Text>
                      {attrs.specs.map((s, idx) => (
                        <View key={idx} style={styles.nvRow}>
                          <Text style={styles.nvName}>{s.name}</Text>
                          <Text style={styles.nvValue}>{s.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Description */}
                  {attrs?.description ? (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={styles.cardTitle}>Description</Text>
                      <Text style={styles.description}>
                        {attrs.description}
                      </Text>
                    </View>
                  ) : null}

                  {/* Nutrition */}
                  {attrs?.nutrition ? (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={styles.cardTitle}>Nutrition info</Text>
                      <Text style={styles.description}>{attrs.nutrition}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </>
          )}
        </View>
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
            disabled={
              isOutOfStock ||
              qty >= (Number(viewProduct?._stock_value ?? 0) || 0)
            }
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

  pagerDotsWrap: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  pagerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  pagerDotActive: {
    backgroundColor: colors.primary,
  },
});
