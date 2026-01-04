import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { IMAGES } from "../../const/imageConst";
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Card from "../../components/ui/Card";
import Divider from "../../components/ui/Divider";
import { SafeAreaView } from "react-native-safe-area-context";
import WishlistEmptySvg from "../../../assets/wishlist_empty.svg";
import { cacheGet, cacheSet, cacheClear } from "../../services/cache";
import { fetchProductWithAttributes } from "../../services/adminApi";

// =====================================================
// MAIN WISHLIST SCREEN
// =====================================================
export default function Wishlist() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    if (user) loadWishlist();
  }, [user]);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      if (user) loadWishlist();
    }, [user])
  );

  // -----------------------------------------------------
  // Load wishlist items (robust, merge products separately)
  // -----------------------------------------------------
  async function loadWishlist() {
    setLoading(true);
    const cacheKey = user ? `wishlist:${user.id}` : null;
    if (cacheKey) {
      const cached = cacheGet(cacheKey);
      if (cached) setItems(cached);
    }

    // Fetch base wishlist rows first
    const { data: rawRows, error: baseErr } = await supabase
      .from("wishlist")
      .select("id, product_id")
      .eq("user_id", user.id);

    const raw = baseErr ? [] : rawRows || [];

    // Collect product ids
    const productIds = Array.from(
      new Set(raw.map((r) => r.product_id).filter(Boolean))
    );

    // Try to fetch product info via store_inventory relation (works when products select may be restricted)
    let prodMap = {};
    if (productIds.length) {
      try {
        const { data: invRows } = await supabase
          .from("store_inventory")
          .select(
            "product_id, products(id, name, price, mrp, image_url, short_desc)"
          )
          .in("product_id", productIds);
        (invRows || []).forEach((r) => {
          if (r?.products) prodMap[r.product_id] = r.products;
        });
      } catch (e) {
        // ignore and fallback
      }
    }

    // For any remaining product ids, fetch directly from products table
    const missing = productIds.filter((id) => !prodMap[id]);
    if (missing.length) {
      try {
        const { data: prodRows } = await supabase
          .from("products")
          .select("id, name, price, mrp, image_url, short_desc")
          .in("id", missing);
        (prodRows || []).forEach((p) => (prodMap[p.id] = p));
      } catch (e) {
        // ignore
      }
    }

    // Merge
    const merged = raw.map((r) => ({
      ...r,
      products: prodMap[r.product_id] || null,
    }));

    setItems(merged);
    if (cacheKey) cacheSet(cacheKey, merged, 5 * 60 * 1000);
    setLoading(false);

    // Background reconciliation for missing product details
    const missingIds = merged
      .filter((m) => !m.products)
      .map((m) => m.product_id);
    if (missingIds.length) {
      const debug = {
        missing: missingIds,
        fetchedFromInventory: Object.keys(prodMap),
      };
      // debug logging removed

      for (const pid of missingIds) {
        try {
          const { data, error } = await fetchProductWithAttributes(pid);
          const prod = data?.product || null;
          if (prod) {
            setItems((prev) =>
              prev.map((it) =>
                it.product_id === pid
                  ? {
                      ...it,
                      products: {
                        ...prod,
                        price: Number(prod.price) || 0,
                        mrp: Number(prod.mrp) || Number(prod.price) || 0,
                      },
                    }
                  : it
              )
            );
            if (cacheKey) {
              const updated = (cacheGet(cacheKey) || []).map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              );
              cacheSet(cacheKey, updated, 5 * 60 * 1000);
            }
            continue;
          }
        } catch (e) {
          // fetch fallback failed; swallow error silently
        }

        try {
          const { data: prodRow } = await supabase
            .from("products")
            .select("id, name, price, mrp, image_url, short_desc")
            .eq("id", pid)
            .maybeSingle();
          if (prodRow) {
            const prod = {
              ...prodRow,
              price: Number(prodRow.price) || 0,
              mrp: Number(prodRow.mrp) || Number(prodRow.price) || 0,
            };
            setItems((prev) =>
              prev.map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              )
            );
            if (cacheKey) {
              const updated = (cacheGet(cacheKey) || []).map((it) =>
                it.product_id === pid ? { ...it, products: prod } : it
              );
              cacheSet(cacheKey, updated, 5 * 60 * 1000);
            }
            continue;
          }
        } catch (e) {
          // fallback fetch failed; swallow error silently
        }
      }
    }
  }

  // -----------------------------------------------------
  // Remove item from wishlist
  // -----------------------------------------------------
  async function removeItem(wishlistId) {
    await supabase.from("wishlist").delete().eq("id", wishlistId);
    cacheClear(user ? `wishlist:${user.id}` : undefined);
    loadWishlist();
  }

  // -----------------------------------------------------
  // Add to Cart from Wishlist
  // -----------------------------------------------------
  async function addItemToCart(productId, wishlistId) {
    // Check if exists in cart
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      // Increase quantity
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      // Add new cart row
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
    }

    // Remove item from wishlist
    await supabase.from("wishlist").delete().eq("id", wishlistId);
    // Invalidate caches and refresh
    cacheClear(user ? `cart:${user.id}` : undefined);
    cacheClear(user ? `wishlist:${user.id}` : undefined);
    await loadWishlist();
  }

  // -----------------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------------
  if (!loading && items.length === 0)
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.screenBG }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.lg,
        }}
      >
        <WishlistEmptySvg width={160} height={160} />
        <Text
          style={{
            fontSize: textSizes.lg,
            color: colors.textPrimary,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
            fontWeight: fontWeights.bold,
            textAlign: "center",
          }}
        >
          Your wishlist is empty
        </Text>
        <Text
          style={{
            fontSize: textSizes.md,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.md,
          }}
        >
          Browse products and add items to your wishlist.
        </Text>
        <Button
          size="sm"
          onPress={() =>
            navigation.navigate("UserTabs", { screen: "Categories" })
          }
        >
          Browse Categories
        </Button>
      </ScrollView>
    );

  // -----------------------------------------------------
  // MAIN UI
  // -----------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        {/* List of wishlist items */}
        {items.map((i) => {
          const p = i.products || {};
          const isValidImage =
            p.image_url &&
            typeof p.image_url === "string" &&
            p.image_url.startsWith("http");
          const price = Number(p.price) || 0;
          const mrp = Number(p.mrp) || price;
          const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return (
            <Card key={i.id} style={{ marginBottom: spacing.md }}>
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    product: p || { id: i.product_id },
                  })
                }
                style={{ flexDirection: "row" }}
              >
                {/* IMAGE */}
                <Image
                  source={isValidImage ? { uri: p.image_url } : IMAGES.default}
                  style={{
                    width: 70,
                    height: 70,
                    marginRight: 12,
                    borderRadius: 10,
                    backgroundColor: colors.white100,
                  }}
                />

                {/* INFO */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: textSizes.md,
                      fontWeight: fontWeights.semibold,
                      color: colors.textPrimary,
                    }}
                    numberOfLines={1}
                  >
                    {p.name || `Product #${i.product_id}`}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: textSizes.xs,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {p.short_desc || ""}
                  </Text>

                  {/* PRICE */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: textSizes.md,
                        fontWeight: fontWeights.bold,
                        color: colors.textPrimary,
                      }}
                    >
                      ₹{price}
                    </Text>
                    <Text
                      style={{
                        fontSize: textSizes.xs,
                        color: colors.textSecondary,
                        textDecorationLine: "line-through",
                      }}
                    >
                      ₹{mrp}
                    </Text>
                    <Text
                      style={{
                        fontSize: textSizes.xs,
                        color: colors.success,
                        fontWeight: fontWeights.semibold,
                      }}
                    >
                      {discount}% OFF
                    </Text>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: spacing.sm,
                      gap: 10,
                    }}
                  >
                    <Button
                      size="sm"
                      onPress={() => addItemToCart(i.product_id, i.id)}
                      style={{ flex: 1 }}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => removeItem(i.id)}
                      style={{ flex: 1 }}
                    >
                      Remove
                    </Button>
                  </View>
                </View>
              </Pressable>
            </Card>
          );
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}
