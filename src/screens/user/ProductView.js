import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  addToCart,
  removeFromCart,
  getCartCount,
} from "../../services/cartService";
import { IMAGES } from "../../const/imageConst";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";

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
        {/* Product Image */}
        {p.image_url ? (
          <Image
            source={{ uri: p.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Image
              source={IMAGES.default}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={styles.productName}>{p.name}</Text>
        <Text style={styles.shortDesc} numberOfLines={1}>
          {p.short_desc || p.description || "—"}
        </Text>

        {/* Discount */}
        <Text style={styles.discountBadge}>
          {(((p.mrp - p.price) / p.mrp) * 100).toFixed(0)}% OFF
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.price}</Text>
          <Text style={styles.mrp}>₹{p.mrp}</Text>
        </View>

        {/* Quantity controls */}
        <View style={styles.qtyRow}>
          <Button
            size="small"
            onPress={() => handleRemove(p)}
            disabled={qty === 0}
            style={styles.qtyBtn}
          >
            -
          </Button>

          <Text style={styles.qtyText}>{qty}</Text>

          <Button size="small" onPress={() => handleAdd(p)}>
            +
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Horizontal category (group) list */}
      <View style={styles.groupTabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {groups.map((grp) => (
            <Button
              key={grp.id}
              onPress={() => setActiveGroup(grp.id)}
              variant={activeGroup === grp.id ? "default" : "secondary"}
              style={styles.groupButton}
            >
              {grp.name}
            </Button>
          ))}
        </ScrollView>
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
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 120 }}
          style={{ paddingHorizontal: 12 }}
        />
      )}

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Button
          onPress={() => navigation.navigate("Cart")}
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
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  groupTabs: {
    paddingVertical: 10,
  },

  groupButton: {
    marginRight: 8,
    paddingHorizontal: 12,
  },

  productCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },

  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },

  placeholderBox: {
    width: "100%",
    height: 120,
    backgroundColor: "#EEE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  shortDesc: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6,
  },

  discountBadge: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
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
    fontSize: 14,
    fontWeight: "700",
  },

  mrp: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },

  qtyBtn: {
    width: 28,
    paddingHorizontal: 0,
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
});
