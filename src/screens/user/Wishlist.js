import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { IMAGES } from "../../const/imageConst";
import Button from "../../components/Button/Button";

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
  // Load wishlist items
  // -----------------------------------------------------
  async function loadWishlist() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        id,
        product_id,
        products (
          id,
          name,
          price,
          mrp,
          image_url,
          short_desc,
          description
        )
      `
      )
      .eq("user_id", user.id);

    if (!error) setItems(data || []);

    setLoading(false);
  }

  // -----------------------------------------------------
  // Remove item from wishlist
  // -----------------------------------------------------
  async function removeItem(wishlistId) {
    await supabase.from("wishlist").delete().eq("id", wishlistId);
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

    // Refresh UI
    loadWishlist();
  }

  // -----------------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------------
  if (!loading && items.length === 0)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        <Button
          onPress={() => navigation.navigate("UserTabs", { screen: "Cart" })}
        >
          Browse Products
        </Button>
      </View>
    );

  // -----------------------------------------------------
  // MAIN UI
  // -----------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Wishlist</Text>

      {items.map((i) => {
        const p = i.products;

        const isValidImage =
          p.image_url &&
          typeof p.image_url === "string" &&
          p.image_url.startsWith("http");

        const mrp = p.mrp || p.price;
        const discount = Math.round(((mrp - p.price) / mrp) * 100);

        return (
          <Pressable
            key={i.id}
            style={styles.item}
            onPress={() =>
              navigation.navigate("ProductDetails", { product: p })
            }
          >
            {/* IMAGE */}
            <Image
              source={isValidImage ? { uri: p.image_url } : IMAGES.default}
              style={styles.productImage}
            />

            {/* INFO */}
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{p.name}</Text>

              <Text style={styles.shortDesc} numberOfLines={1}>
                {p.short_desc || ""}
              </Text>

              {/* PRICE */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{p.price}</Text>
                <Text style={styles.mrp}>₹{mrp}</Text>
                <Text style={styles.discount}>{discount}% OFF</Text>
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => addItemToCart(p.id, i.id)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>ADD TO CART</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeItem(i.id)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        );
      })}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9F9F9",
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  item: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },

  productImage: {
    width: 70,
    height: 70,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
  },

  shortDesc: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
  },

  mrp: {
    fontSize: 13,
    color: "#777",
    textDecorationLine: "line-through",
  },

  discount: {
    fontSize: 13,
    color: "green",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  addBtn: {
    backgroundColor: "#1daf80",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  removeBtn: {
    backgroundColor: "#F4F4F4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  removeBtnText: {
    color: "#E91E63",
    fontWeight: "600",
    fontSize: 13,
  },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 18,
    marginBottom: 14,
  },
});
