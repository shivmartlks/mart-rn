import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import {
  addToCart,
  removeFromCart,
  getCartCount,
} from "../../services/cartService";
import { IMAGES } from "../../const/imageConst";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import QuantitySelector from "../../components/ui/QuantitySelector";
import DefaultProduct from "../../../assets/default_product.svg";
import { cacheGet, cacheSet } from "../../services/cache";
import { cacheClear } from "../../services/cache";
import Badge from "../../components/ui/Badge";
import ProductCard from "./common/productCard";

// Theme tokens
import { colors, spacing, textSizes, radii, fontWeights } from "../../theme";

export default function Products() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { id: subcategoryId } = route.params;
  const isFocused = useIsFocused();

  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);

  // ------------------------------------
  // Load data
  // ------------------------------------
  useEffect(() => {
    if (subcategoryId && user) fetchData(subcategoryId);
  }, [subcategoryId, user]);

  useEffect(() => {
    if (isFocused && subcategoryId && user) fetchData(subcategoryId);
  }, [isFocused]);

  async function fetchData(id) {
    setLoading(true);

    try {
      const grpKey = `groups:${id}`;
      const prodKey = `products:${id}`;
      const cachedGroups = cacheGet(grpKey);
      const cachedProducts = cacheGet(prodKey);

      let g, p;
      if (cachedGroups && cachedProducts) {
        g = cachedGroups;
        p = cachedProducts;
      } else {
        const { data: grps } = await supabase
          .from("product_groups")
          .select("*")
          .eq("subcategory_id", id)
          .eq("user_visibility", true)
          .order("name");

        const groupIds = (grps || []).map((g) => g.id);

        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .in("group_id", groupIds)
          .eq("user_visibility", true)
          .order("name");

        g = grps || [];
        p = prods || [];
        cacheSet(grpKey, g);
        cacheSet(prodKey, p);
      }

      setGroups(g);
      setProducts(p);
      if (g.length) setActiveGroup(g[0].id);

      // Fetch inventory for these products from store_inventory
      const productIds = (p || []).map((x) => x.id);
      let invMap = {};
      if (productIds.length) {
        const { data: invRows } = await supabase
          .from("store_inventory")
          .select("product_id, stock_value")
          .in("product_id", productIds);
        (invRows || []).forEach((r) => (invMap[r.product_id] = r.stock_value));
      }
      // Attach inventory to products in state for convenience
      setProducts((prev) =>
        prev.map((x) => ({ ...x, _stock_value: invMap[x.id] ?? 0 }))
      );

      // Fetch first images from product_images and attach to products
      if (productIds.length) {
        const { data: imgRows, error: imgErr } = await supabase
          .from("product_images")
          .select("*")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true });
        if (imgErr) console.log("[Products] product_images error", imgErr);
        console.log(
          "[Products] product_images rows",
          Array.isArray(imgRows) ? imgRows.length : 0,
          Array.isArray(imgRows) ? imgRows.slice(0, 3) : []
        );
        const imgMap = {};
        (imgRows || []).forEach((row) => {
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
          if (!imgMap[pid]) imgMap[pid] = [];
          imgMap[pid].push({ uri });
        });
        console.log("[Products] built imagesMap", imgMap);
        setProducts((prev) =>
          prev.map((x) => ({ ...x, images: imgMap[x.id] || [] }))
        );
        // Log imagesLen after attachment
        setProducts((prev) => {
          try {
            console.log(
              "[Products] products with images",
              prev.map((pp) => ({
                id: pp.id,
                imagesLen: Array.isArray(pp.images) ? pp.images.length : 0,
                first: pp.images?.[0]?.uri,
              }))
            );
          } catch {}
          return prev;
        });
      }

      if (user) {
        const count = await getCartCount(user.id);
        setCartCount(count);
        await loadCartItems();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCartItems() {
    if (!user) return;

    const { data } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("user_id", user.id);

    const map = {};
    data?.forEach((item) => (map[item.product_id] = item.quantity));
    setCartItems(map);
  }

  // ------------------------------------
  // Add / Remove cart
  // ------------------------------------
  async function handleAdd(product) {
    if (!user) return;

    const res = await addToCart(product.id, user.id);
    if (!res.error) {
      const newQty = (cartItems[product.id] || 0) + 1;
      setCartItems({ ...cartItems, [product.id]: newQty });
      setCartCount((prev) => prev + 1);
      // Invalidate cart cache so Cart loads fresh data
      cacheClear(`cart:${user.id}`);
    }
  }

  async function handleRemove(product) {
    const currentQty = cartItems[product.id] || 0;
    if (currentQty === 0) return;

    const res = await removeFromCart(product.id, user.id);
    if (!res.error) {
      const newQty = currentQty - 1;
      const updated = { ...cartItems };
      if (newQty > 0) updated[product.id] = newQty;
      else delete updated[product.id];

      setCartItems(updated);
      setCartCount((prev) => prev - 1);
      // Invalidate cart cache so Cart loads fresh data
      cacheClear(`cart:${user.id}`);
    }
  }

  // ------------------------------------
  // Filtered products
  // ------------------------------------
  const filteredProducts = products.filter((p) => p.group_id === activeGroup);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // ------------------------------------
  // Render Product Card
  // ------------------------------------
  const renderProduct = ({ item: p }) => {
    // Skip rendering if product is not available or hidden
    if (p.user_visibility === false) return null;

    const qty = cartItems[p.id] || 0;
    const isOutOfStock = (p._stock_value ?? 0) <= 0;

    return (
      <ProductCard
        product={p}
        qty={qty}
        onIncrease={() => handleAdd(p)}
        onDecrease={() => handleRemove(p)}
        onPress={() => navigation.navigate("ProductDetails", { product: p })}
        showQuantityControls={!isOutOfStock}
        showStockOverlays={true}
      />
    );
  };

  // ------------------------------------
  // Render Group Item (Sidebar)
  // ------------------------------------
  const renderGroupItem = ({ item: grp }) => {
    const isActive = activeGroup === grp.id;
    return (
      <Pressable
        key={grp.id}
        onPress={() => setActiveGroup(grp.id)}
        style={[styles.groupItem, isActive && styles.activeGroupItem]}
      >
        <Text style={[styles.groupName, isActive && styles.activeGroupName]}>
          {grp.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen]}>
      {/* Ensure scroll area has extra bottom padding so content isn’t hidden behind floating button */}
      <View style={styles.mainContent}>
        <View style={styles.sidebar}>
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Right Pane: Products */}
        <View style={styles.productArea}>
          {/* Right Pane Header (for filters) */}
          <View style={styles.rightHeader}>
            <Text style={styles.rightHeaderText}>
              {groups.find((g) => g.id === activeGroup)?.name || ""}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="sliders" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather
                  name="bar-chart-2"
                  size={16}
                  color={colors.textPrimary}
                  style={styles.iconRotated}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.noProductsText}>
                No products available in this group.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={true}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </View>
      </View>

      {/* Floating Cart Button with safe area + reserved footer space */}
      {cartCount > 0 && (
        <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
          <View style={styles.footerReserved}>
            <Button
              onPress={() =>
                navigation.navigate("UserTabs", { screen: "Cart" })
              }
              style={styles.footerButton}
            >
              {`${cartCount} items in Cart`}
            </Button>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

// --------------------------------------------------------
// STYLES
// --------------------------------------------------------
// Updated background color to match the profile page
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBG, // Updated to use the same background color as the profile page
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  // Sidebar (Left Pane)
  sidebar: {
    width: "28%",
    backgroundColor: colors.backgroundMuted || colors.screenBG, // Updated to match the profile page
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  groupItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activeGroupItem: {
    backgroundColor: colors.cardSoft || colors.cardLight,
    borderRightColor: colors.primary, // Changed from borderLeftColor to borderRightColor
    borderRightWidth: 3, // Moved the active indicator to the right side
  },
  groupName: {
    fontSize: textSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  activeGroupName: {
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },

  // Product Area (Right Pane)
  productArea: {
    flex: 1,
  },
  rightHeader: {
    padding: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rightHeaderText: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    columnGap: spacing.sm, // not supported everywhere, but harmless; RN will ignore in older versions
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.xs,
  },
  iconRotated: {
    transform: [{ rotate: "90deg" }],
  },

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

  productImage: {
    width: "100%",
    height: "100%",
  },

  floatingControl: {
    position: "absolute",
    bottom: 8,
    right: 8,
    // don't set background here — QuantitySelector receives bg/borderColor/iconColor props
  },

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

  discountBadge: {
    marginLeft: spacing.xs,
  },

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

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    justifyContent: "space-between",
  },

  qtyText: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    minWidth: 20,
    textAlign: "center",
  },

  cartButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 28,
    elevation: 6,
  },

  lowStockWarning: {
    color: colors.warning, // Orange text color
    fontSize: textSizes.sm,
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
  },
  outOfStockWarning: {
    color: colors.textSecondary,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.bold,
    marginTop: spacing.xs,
  },

  outOfStockOverlay: {
    position: "absolute",
    top: "50%", // Center vertically within the image
    left: "50%", // Center horizontally within the image
    transform: [{ translateX: -50 }, { translateY: -50 }], // Adjust for true center
    height: 32, // Fixed height
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md, // Added padding for better text alignment
  },
  outOfStockText: {
    color: colors.white50,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.bold,
  },

  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  productCardOutOfStock: {
    opacity: 0.5,
  },

  noProductsText: {
    color: colors.textSecondary,
  },

  footerSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerReserved: {
    paddingBottom: spacing.lg,
  },
  footerButton: {
    alignSelf: "flex-end",
    marginRight: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 28,
    elevation: 6,
  },
});
