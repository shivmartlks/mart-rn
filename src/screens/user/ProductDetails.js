import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { addToCart, removeFromCart } from "../../services/cartService";
import { supabase } from "../../services/supabase";
import { colors } from "../../Theme/theme";
import { useAuth } from "../../contexts/AuthContext";
import { IMAGES } from "../../const/imageConst";

export default function ProductDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const product = route.params?.product;
  const [qty, setQty] = useState(0); // NEW: starts at 0 always

  // -----------------------------------------------------
  // Load quantity from cart_items when screen opens
  // -----------------------------------------------------
  async function fetchQuantity() {
    if (!user || !product?.id) return;

    const { data } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    setQty(data?.quantity || 0);
  }

  // Load on first mount
  useEffect(() => {
    fetchQuantity();
  }, [product, user]);

  // Load every time screen appears again
  useFocusEffect(
    useCallback(() => {
      fetchQuantity();
    }, [product, user])
  );

  // -----------------------------------------------------
  // Cart handlers
  // -----------------------------------------------------
  const handleAdd = async () => {
    if (!user) return;
    await addToCart(product.id, user.id);
    fetchQuantity(); // refresh qty after update
  };

  const handleRemove = async () => {
    if (qty === 0) return;
    await removeFromCart(product.id, user.id);
    fetchQuantity(); // refresh qty after update
  };

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------
  const isValidImage =
    product.image_url &&
    typeof product.image_url === "string" &&
    product.image_url.startsWith("http");

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Product Image */}
        <Image
          source={isValidImage ? { uri: product.image_url } : IMAGES.default}
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* Details */}
        <View style={styles.detailsBox}>
          <Text style={styles.name}>{product.name}</Text>

          {product.short_desc ? (
            <Text style={styles.short}>{product.short_desc}</Text>
          ) : null}

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>

            {product.mrp ? (
              <>
                <Text style={styles.mrp}>₹{product.mrp}</Text>
                <Text style={styles.discount}>
                  {(
                    ((product.mrp - product.price) / product.mrp) *
                    100
                  ).toFixed(0)}
                  % OFF
                </Text>
              </>
            ) : null}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.description}>
            {product.description || "No description available."}
          </Text>
        </View>
      </ScrollView>

      {/* ===========================
          FOOTER ADD / QTY BUTTON
      ============================ */}
      {qty === 0 ? (
        <Pressable style={styles.addFooter} onPress={handleAdd}>
          <Text style={styles.addFooterText}>ADD TO CART</Text>
        </Pressable>
      ) : (
        <View style={styles.qtyFooter}>
          <Pressable onPress={handleRemove} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>−</Text>
          </Pressable>

          <Text style={styles.footerQty}>{qty}</Text>

          <Pressable onPress={handleAdd} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white50 },

  productImage: {
    width: "100%",
    height: 300,
    marginBottom: 16,
    backgroundColor: colors.white50,
  },

  detailsBox: {
    padding: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black800,
  },

  short: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 4,
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black800,
  },

  mrp: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: colors.gray500,
  },

  discount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.green600,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
    color: colors.black700,
  },

  description: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
  },

  // Footer Add Button
  addFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.green600,
    paddingVertical: 16,
    alignItems: "center",
  },

  addFooterText: {
    color: colors.white50,
    fontSize: 16,
    fontWeight: "600",
  },

  // Footer qty controller
  qtyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.green50,
    borderTopWidth: 1,
    borderTopColor: colors.green200,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  footerBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.white50,
    borderWidth: 1,
    borderColor: colors.green300,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  footerBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.green600,
  },

  footerQty: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.green700,
  },
});
