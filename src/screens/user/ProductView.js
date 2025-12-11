// src/screens/ProductView.js
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
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
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

// Theme tokens
import { colors, spacing, textSizes, radii, fontWeights } from "../../theme";

export default function ProductView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { id: subcategoryId } = route.params;

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

  async function fetchData(id) {
    setLoading(true);

    try {
      const { data: grps } = await supabase
        .from("product_groups")
        .select("*")
        .eq("subcategory_id", id)
        .order("name");

      const groupIds = (grps || []).map((g) => g.id);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .in("group_id", groupIds)
        .order("name");

      setGroups(grps || []);
      setProducts(prods || []);
      if (grps?.length) setActiveGroup(grps[0].id);

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
    }
  }

  // ------------------------------------
  // Filtered products
  // ------------------------------------
  const filteredProducts = products.filter(
    (p) => p.group_id === activeGroup // Include all products in the active group
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading products...
        </Text>
      </View>
    );
  }

  // ------------------------------------
  // Render Product Card
  // ------------------------------------
  const renderProduct = ({ item: p }) => {
    const qty = cartItems[p.id] || 0;
    const mrp = p.mrp || p.price;
    const discount = mrp ? Math.round(((mrp - p.price) / mrp) * 100) : 0;

    const isValidImage = p.image_url?.startsWith("http");
    const isOutOfStock = !p.is_available;
    const isLowStock = p.stock_value < 5 && p.stock_value > 0;

    return (
      <View
        style={[
          styles.productCard,
          isOutOfStock && { opacity: 0.5 }, // Gray out the product if out of stock
        ]}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={isValidImage ? { uri: p.image_url } : IMAGES.default}
            style={styles.productImage}
          />

          {/* Out of Stock Label */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          {/* Floating ADD / Qty — use QuantitySelector (advanced) + style positioning */}
          {!isOutOfStock && (
            <QuantitySelector
              value={qty}
              variant="advanced"
              mode="filled" // outline pill in product grid
              size="sm"
              onIncrease={() => handleAdd(p)}
              onDecrease={() => handleRemove(p)}
              style={{ position: "absolute", bottom: 8, right: 8 }} // floating placement
              disableIncrease={qty >= p.stock_value} // Disable + button if stock is exceeded
            />
          )}
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {p.name}
        </Text>
        <Text style={styles.shortDesc} numberOfLines={1}>
          {p.short_desc || p.description}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.price}</Text>
          <Text style={styles.mrp}>₹{mrp}</Text>
          {discount > 0 && (
            <Text style={styles.discountBadge}>{discount}% OFF</Text>
          )}
        </View>

        {/* Stock Warnings */}
        {isLowStock && !isOutOfStock && (
          <Text style={styles.lowStockWarning}>Hurry, only few left</Text>
        )}
      </View>
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
      <View style={styles.mainContent}>
        {/* Left Pane: Group Sidebar */}
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
                  style={{ transform: [{ rotate: "90deg" }] }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ color: colors.textSecondary }}>
                No products available in this group.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={{ paddingHorizontal: spacing.sm }}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: spacing.sm,
              }}
            />
          )}
        </View>
      </View>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Button
          onPress={() => navigation.navigate("UserTabs", { screen: "Cart" })}
          style={styles.cartButton}
        >
          {`${cartCount} items in Cart`}
        </Button>
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
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
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

  productCard: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    maxWidth: "48%",
  },

  imageWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray100,
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
    backgroundColor: colors.successBg || colors.success + "22",
    color: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: textSizes.xs,
    fontWeight: fontWeights.semibold,
    alignSelf: "flex-start",
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
});
