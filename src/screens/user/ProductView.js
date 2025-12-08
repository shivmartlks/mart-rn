import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
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
import Button from "../../components/Button/Button";
import { colors, textSizes, radius } from "../../Theme/theme";

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

      const groupIds = grps.map((g) => g.id);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .in("group_id", groupIds)
        .order("name");

      setGroups(grps);
      setProducts(prods);
      if (grps.length) setActiveGroup(grps[0].id);

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
    (p) => p.group_id === activeGroup && p.is_available
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading products...</Text>
      </View>
    );
  }

  // ------------------------------------
  // Render Product Card
  // ------------------------------------
  const renderProduct = ({ item: p }) => {
    const qty = cartItems[p.id] || 0;

    return (
      <View style={styles.productCard}>
        <Pressable
          onPress={() => navigation.navigate("ProductDetails", { product: p })}
          style={{ flex: 1 }}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={p.image_url ? { uri: p.image_url } : IMAGES.default}
              style={styles.productImage}
            />

            {/* Floating ADD / Qty (unchanged) */}
            {qty === 0 ? (
              <TouchableOpacity
                onPress={() => handleAdd(p)}
                style={styles.addFloatingBtn}
              >
                <Text style={styles.addFloatingText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyFloatingBox}>
                <Pressable
                  style={styles.qtyBtnSmall}
                  onPress={() => handleRemove(p)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>

                <Text style={styles.qtyNumberFloating}>{qty}</Text>

                <Pressable
                  style={styles.qtyBtnSmall}
                  onPress={() => handleAdd(p)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{p.name}</Text>
          <Text style={styles.shortDesc} numberOfLines={1}>
            {p.short_desc || p.description}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{p.price}</Text>
            <Text style={styles.mrp}>₹{p.mrp}</Text>
          </View>
        </Pressable>
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
    <View style={styles.screen}>
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
              {/* {groups.find((g) => g.id === activeGroup)?.name} */}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="sliders" size={16} color={colors.black500} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather
                  name="bar-chart-2"
                  size={16}
                  color={colors.black500}
                  style={{ transform: [{ rotate: "90deg" }] }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <View style={styles.center}>
              <Text>No products available in this group.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              columnWrapperStyle={{ gap: 8 }}
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
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white50,
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
    backgroundColor: "#F8F8F8",
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
  },
  groupItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  activeGroupItem: {
    backgroundColor: colors.white50,
    borderLeftColor: colors.black800,
    borderLeftWidth: 3,
  },
  groupName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.black500,
  },
  activeGroupName: {
    fontWeight: "700",
    color: colors.black800,
  },

  // Product Area (Right Pane)
  productArea: {
    flex: 1,
  },
  rightHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  rightHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  productCard: {
    flex: 1, // Allow items to expand and fill their column space
    backgroundColor: colors.white50,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 8,
    maxWidth: "50%",
  },

  productImage: {
    width: "100%",
    aspectRatio: 1, // Creates a square image
    marginBottom: 8,
    backgroundColor: "#F0F0F0", // Background for the placeholder
  },

  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.black800,
  },

  shortDesc: {
    fontSize: 10,
    color: "#777",
    marginBottom: 6,
  },

  discountBadge: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },

  price: {
    fontSize: 13,
    fontWeight: "700",
  },

  mrp: {
    fontSize: 10,
    textDecorationLine: "line-through",
    color: colors.gray500,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },

  cartButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
  },

  // Floating ADD Button
  addFloatingBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: colors.white50,
    borderWidth: 0.8, // thinner border
    borderColor: colors.green300, // softer shade
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    elevation: 2, // lighter shadow
  },
  addFloatingText: {
    color: colors.green600,
    fontWeight: "700",
    fontSize: 11,
  },

  // Floating Qty Controller
  qtyFloatingBox: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: colors.green50,
    borderWidth: 0.8, // thin border
    borderColor: colors.green300,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    elevation: 2,
  },

  qtyBtnSmall: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 0.8, // thinner
    borderColor: colors.green300, // lighter shade
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white50,
  },
  qtyBtnText: {
    color: colors.green600,
    fontSize: 16,
    fontWeight: "700",
    marginTop: -2,
  },

  qtyNumberFloating: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.green600,
  },
});
