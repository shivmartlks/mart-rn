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
import { supabase, SUPABASE_URL } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { IMAGES } from "../../const/imageConst";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
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

  async function fetchImagesForWishlist(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) return {};
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });
      if (error) {
        console.log("[Wishlist] product_images error", error);
        return {};
      }
      console.log(
        "[Wishlist] product_images rows",
        Array.isArray(data) ? data.length : 0,
        Array.isArray(data) ? data.slice(0, 3) : []
      );
      const map = {};
      (data || []).forEach((row) => {
        const pid = row.product_id ?? row.productId ?? row.product ?? null;
        const uri =
          row.image_url ||
          row.url ||
          row.path ||
          row.uri ||
          row.file_path ||
          row.src ||
          "";
        if (!pid || !uri) return;
        if (!map[pid]) map[pid] = [];
        map[pid].push({ uri });
      });
      console.log("[Wishlist] built imagesMap", map);
      return map;
    } catch (e) {
      console.log("[Wishlist] fetchImagesForWishlist exception", e);
      return {};
    }
  }

  // -----------------------------------------------------
  // Load wishlist items (robust, merge products separately)
  // -----------------------------------------------------
  async function loadWishlist() {
    setLoading(true);
    const cacheKey = user ? `wishlist:${user.id}` : null;

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

    // Fetch product info via store_inventory relation
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
      } catch (e) {}
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
      } catch (e) {}
    }

    // Merge base + products (do not set state yet)
    const merged = raw.map((r) => ({
      ...r,
      products: prodMap[r.product_id] || null,
    }));

    // Attach first image from product_images for each product
    const ids = merged.map((m) => m.product_id).filter(Boolean);
    let imgMap = {};
    if (ids.length) {
      imgMap = await fetchImagesForWishlist(ids);
    }
    const mergedWithImages = merged.map((m) => {
      const p = m.products || {};
      const images = imgMap[m.product_id] || [];
      return { ...m, products: { ...p, images } };
    });

    // Set final items once to avoid flicker
    setItems(mergedWithImages);
    if (cacheKey) cacheSet(cacheKey, mergedWithImages, 5 * 60 * 1000);
    setLoading(false);

    // Background reconciliation for missing product details (preserve images/name)
    const missingIds = merged
      .filter((m) => !m.products)
      .map((m) => m.product_id);
    if (missingIds.length) {
      for (const pid of missingIds) {
        try {
          const { data } = await fetchProductWithAttributes(pid);
          const prod = data?.product || null;
          if (prod) {
            setItems((prev) =>
              prev.map((it) => {
                if (it.product_id !== pid) return it;
                const existing = it.products || {};
                return {
                  ...it,
                  products: {
                    ...existing,
                    ...prod,
                    price: Number(prod.price ?? existing.price ?? 0) || 0,
                    mrp:
                      Number(
                        prod.mrp ??
                          existing.mrp ??
                          prod.price ??
                          existing.price ??
                          0
                      ) || 0,
                    images: Array.isArray(existing.images)
                      ? existing.images
                      : [],
                    name: prod.name ?? existing.name ?? `Product #${pid}`,
                  },
                };
              })
            );
            continue;
          }
        } catch {}

        try {
          const { data: prodRow } = await supabase
            .from("products")
            .select("id, name, price, mrp, image_url, short_desc")
            .eq("id", pid)
            .maybeSingle();
          if (prodRow) {
            setItems((prev) =>
              prev.map((it) => {
                if (it.product_id !== pid) return it;
                const existing = it.products || {};
                const prod = {
                  ...prodRow,
                  price: Number(prodRow.price ?? existing.price ?? 0) || 0,
                  mrp:
                    Number(
                      prodRow.mrp ??
                        existing.mrp ??
                        prodRow.price ??
                        existing.price ??
                        0
                    ) || 0,
                };
                return {
                  ...it,
                  products: {
                    ...existing,
                    ...prod,
                    images: Array.isArray(existing.images)
                      ? existing.images
                      : [],
                    name: prod.name ?? existing.name ?? `Product #${pid}`,
                  },
                };
              })
            );
            continue;
          }
        } catch {}
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
          const firstImg =
            Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]?.uri
              : null;
          const resolvedUri = normalizeImageUrl(firstImg || p.image_url || "");
          try {
            console.log("[Wishlist] item", i.product_id, {
              firstImg,
              resolvedUri,
            });
          } catch {}
          const isValidImage =
            typeof resolvedUri === "string" && resolvedUri.startsWith("http");
          const price = Number(p.price) || 0;
          const mrp = Number(p.mrp) || price;
          const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return (
            <Card key={i.id} style={{ marginBottom: spacing.md }}>
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    product: p || { id: i.product_id },
                    productId: i.product_id,
                  })
                }
                style={{ flexDirection: "row" }}
              >
                {/* IMAGE */}
                <Image
                  source={
                    isValidImage
                      ? { uri: encodeURI(resolvedUri) }
                      : IMAGES.default
                  }
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
                    {p.name || ""}
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
                    {discount > 0 && (
                      <Badge
                        size="sm"
                        variant="success"
                        label={`${discount}% OFF`}
                        style={styles.discountBadge}
                      />
                    )}
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

const styles = StyleSheet.create({
  noProductsText: {
    color: colors.textSecondary,
  },

  discountBadge: {
    marginLeft: 6,
  },
});
