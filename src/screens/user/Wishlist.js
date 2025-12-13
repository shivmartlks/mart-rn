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
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import Card from "../../components/ui/Card";
import Divider from "../../components/ui/Divider";
import { SafeAreaView } from "react-native-safe-area-context";
import WishlistEmptySvg from "../../../assets/wishlist_empty.svg";

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
          const p = i.products;
          const isValidImage =
            p.image_url &&
            typeof p.image_url === "string" &&
            p.image_url.startsWith("http");
          const mrp = p.mrp || p.price;
          const discount = Math.round(((mrp - p.price) / mrp) * 100);

          return (
            <Card key={i.id} style={{ marginBottom: spacing.md }}>
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetails", { product: p })
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
                    {p.name}
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
                      ₹{p.price}
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
                      onPress={() => addItemToCart(p.id, i.id)}
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
