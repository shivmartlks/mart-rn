import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  FlatList,
  Linking,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes } from "../../theme";
import { Feather } from "@expo/vector-icons";
import { supabase, SUPABASE_URL } from "../../services/supabase";
import SectionTitle from "../../components/ui/SectionTitle";
import ImageCard from "../../components/ui/ImageCard";
import DefaultCategories from "../../../assets/default_categories.svg";
import { getRecentlyViewedIds } from "../../services/recentlyViewed";
import {
  RECENTLY_VIEWED_MAX,
  POPULAR_PRODUCTS_MAX,
  FEATURED_CATEGORIES_MAX,
} from "../../const/listConfig";
import { fetchHomeBanners } from "../../api/storeApi";

export default function Home() {
  const navigation = useNavigation();
  const { homeAlert } = useActiveStore();
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [banners, setBanners] = useState([]);

  const bannerWidth = Dimensions.get("window").width - spacing.md * 2;

  useEffect(() => {
    fetchFeatured();
    fetchPopular();
    fetchBanners();
  }, []);

  // Refresh recently viewed whenever Home gains focus
  useFocusEffect(
    useCallback(() => {
      fetchRecentlyViewed();
    }, [])
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

  async function fetchBanners() {
    try {
      const data = await fetchHomeBanners();
      const normalized = (Array.isArray(data) ? data : []).map((b) => {
        let linkType =
          typeof b.link_type === "string"
            ? b.link_type.toLowerCase()
            : undefined;
        if (linkType === "url") linkType = "external";

        let linkValue = b.link_value;

        if (linkType === "product") {
          const num = Number(linkValue);
          if (Number.isFinite(num)) linkValue = num;
        } else if (linkType === "category") {
          // categories typically numeric; coerce if possible but allow string fallback
          const num = Number(linkValue);
          linkValue = Number.isFinite(num) ? num : String(linkValue);
        } else if (linkType === "subcategory") {
          // subcategory IDs can be UUIDs; keep as trimmed string
          linkValue =
            typeof linkValue === "string"
              ? linkValue.trim()
              : String(linkValue);
        } else if (linkType === "external" && typeof linkValue === "string") {
          if (!/^[a-z]+:\/\//i.test(linkValue)) {
            linkValue = `https://${linkValue}`;
          }
        } else if (linkType === "route") {
          if (typeof linkValue === "string") {
            const trimmed = linkValue.trim();
            if (/^\{/.test(trimmed)) {
              try {
                const obj = JSON.parse(trimmed);
                if (obj && typeof obj.name === "string") linkValue = obj;
              } catch (_) {}
            } else if (/^tab:/i.test(trimmed)) {
              linkValue = { __tab: true, name: trimmed.split(":")[1] };
            } else {
              linkValue = trimmed;
            }
          } else if (
            linkValue &&
            typeof linkValue === "object" &&
            typeof linkValue.name === "string"
          ) {
            // keep as-is
          } else {
            linkValue = "";
          }
        } else if (linkType === "none") {
          // no-op
        }

        const imageUrl = normalizeImageUrl(b.image_url);

        return {
          ...b,
          link_type: linkType,
          link_value: linkValue,
          image_url: imageUrl,
        };
      });

      setBanners(normalized);
    } catch (err) {
      console.error("Failed loading home banners", err);
      setBanners([]);
    }
  }

  async function fetchRecentlyViewed() {
    try {
      const ids = await getRecentlyViewedIds();
      if (!Array.isArray(ids) || ids.length === 0) {
        setRecentProducts([]);
        return;
      }
      // Query product details for these ids
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .limit(RECENTLY_VIEWED_MAX);
      if (error || !Array.isArray(data)) {
        setRecentProducts([]);
        return;
      }
      // Order results to match recent ids (most recent first)
      const map = {};
      data.forEach((p) => {
        map[String(p.id)] = p;
      });
      const ordered = ids.map((id) => map[String(id)]).filter(Boolean);
      setRecentProducts(ordered);
    } catch (err) {
      setRecentProducts([]);
    }
  }

  async function fetchFeatured() {
    try {
      const { data } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_featured", true)
        .eq("user_visibility", true)
        .order("name")
        .limit(FEATURED_CATEGORIES_MAX);

      setFeaturedCategories(data || []);
    } catch (err) {
      console.error("Failed loading featured categories", err);
      setFeaturedCategories([]);
    }
  }

  async function fetchPopular() {
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("user_visibility", true)
        .order("name")
        .limit(POPULAR_PRODUCTS_MAX);

      setFeaturedProducts(data || []);
    } catch (err) {
      console.error("Failed loading featured products", err);
      setFeaturedProducts([]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {homeAlert ? (
        <Card
          variant={homeAlert.variant}
          style={{ margin: spacing.md, marginBottom: spacing.md }}
        >
          <Text
            style={{
              color:
                homeAlert.type === "closed"
                  ? colors.warning
                  : colors.textPrimary,
              fontSize: textSizes.md,
            }}
          >
            {homeAlert.message}
          </Text>
        </Card>
      ) : null}

      {/* SEARCH CARD - placed below alert (if any) and above other sections */}
      <Pressable
        onPress={() => navigation.navigate("Search")}
        style={{ paddingHorizontal: spacing.md }}
        accessibilityRole="button"
      >
        <Card style={styles.searchCard}>
          <View style={styles.searchInner}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <Text style={styles.searchText}>Search for products, brands…</Text>
          </View>
        </Card>
      </Pressable>

      {/* BANNER CAROUSEL - lightweight, swipeable, hidden if none */}
      {banners.length > 0 && (
        <View
          style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}
        >
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => {
              const img = item.image_url ? encodeURI(item.image_url) : "";

              const onPressBanner = () => {
                try {
                  switch (item.link_type) {
                    case "product":
                      if (item.link_value != null)
                        navigation.navigate("ProductDetails", {
                          productId: item.link_value,
                        });
                      break;

                    case "category":
                      if (item.link_value != null)
                        navigation.navigate("Products", {
                          id: item.link_value,
                        });
                      break;

                    case "subcategory":
                      if (item.link_value)
                        navigation.navigate("Products", {
                          id: item.link_value,
                        });
                      break;

                    case "route":
                      if (item.link_value) {
                        if (
                          typeof item.link_value === "object" &&
                          typeof item.link_value.name === "string"
                        ) {
                          if (item.link_value.__tab && item.link_value.name) {
                            navigation.navigate("UserTabs", {
                              screen: item.link_value.name,
                            });
                          } else {
                            navigation.navigate(
                              item.link_value.name,
                              item.link_value.params || {}
                            );
                          }
                        } else if (
                          typeof item.link_value === "string" &&
                          item.link_value
                        ) {
                          // simple route name
                          navigation.navigate(item.link_value);
                        }
                      }
                      break;

                    case "external":
                    case "url": // backward compatibility
                      if (typeof item.link_value === "string")
                        Linking.openURL(item.link_value).catch(() => {});
                      break;

                    case "none":
                      // do nothing
                      break;

                    default:
                      // Unknown type: no-op
                      break;
                  }
                } catch (e) {
                  // ignore navigation errors for lightweight behavior
                }
              };

              return (
                <Pressable
                  onPress={onPressBanner}
                  style={{ marginRight: spacing.md }}
                >
                  {img ? (
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: bannerWidth,
                        height: 140,
                        borderRadius: 8,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.bannerPlaceholder,
                        { width: bannerWidth, height: 140 },
                      ]}
                    />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Featured Categories - horizontal list, hidden if none */}
      {featuredCategories.length > 0 && (
        <View
          style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}
        >
          <SectionTitle title="Featured Categories" />
          <FlatList
            data={featuredCategories}
            horizontal
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => {
              if (item.user_visibility === false) return null;
              const isValidImage =
                item.image_url &&
                typeof item.image_url === "string" &&
                item.image_url.startsWith("http");

              return (
                <Pressable
                  onPress={() =>
                    navigation.navigate("Products", {
                      id: item.id,
                      name: item.name,
                    })
                  }
                  style={styles.featuredItem}
                >
                  <View style={styles.featuredImageContainer}>
                    {isValidImage ? (
                      <Image
                        source={{ uri: encodeURI(item.image_url) }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <DefaultCategories width={56} height={56} />
                    )}
                  </View>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Popular Products - horizontal list, hidden if none */}
      {featuredProducts.length > 0 && (
        <View
          style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}
        >
          <SectionTitle title="Popular Products" />
          <FlatList
            data={featuredProducts}
            horizontal
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => {
              if (item.user_visibility === false) return null;

              const img =
                item.image_url &&
                typeof item.image_url === "string" &&
                item.image_url.startsWith("http")
                  ? encodeURI(item.image_url)
                  : "";

              return (
                <View style={styles.popularItem}>
                  <ImageCard
                    title={item.name}
                    price={item.price}
                    image={img}
                    // Pass the full product object (and id) so ProductDetails can initialize correctly
                    onPress={() =>
                      navigation.navigate("ProductDetails", {
                        product: item,
                        productId: item.id,
                      })
                    }
                    style={styles.popularCard}
                  />
                </View>
              );
            }}
          />
        </View>
      )}

      {/* Recently Viewed - horizontal list, hidden if none */}
      {recentProducts.length > 0 && (
        <View
          style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}
        >
          <SectionTitle title="Recently Viewed" />
          <FlatList
            data={recentProducts}
            horizontal
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => {
              if (item.user_visibility === false) return null;
              const img =
                item.image_url &&
                typeof item.image_url === "string" &&
                item.image_url.startsWith("http")
                  ? encodeURI(item.image_url)
                  : "";
              return (
                <View style={styles.popularItem}>
                  <ImageCard
                    title={item.name}
                    price={item.price}
                    image={img}
                    onPress={() =>
                      navigation.navigate("ProductDetails", {
                        product: item,
                        productId: item.id,
                      })
                    }
                    style={styles.popularCard}
                  />
                </View>
              );
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
    paddingVertical: spacing.md,
  },
  featuredItem: {
    width: 110,
    marginRight: spacing.md,
    alignItems: "center",
  },
  featuredImageContainer: {
    backgroundColor: colors.white200,
    borderRadius: 12,
    width: 92,
    height: 92,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredName: {
    fontSize: textSizes.sm,
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
  popularItem: {
    width: 160,
    marginRight: spacing.md,
  },
  popularCard: {
    width: 160,
  },
  searchCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBG,
    borderColor: colors.border,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: textSizes.md,
  },
  bannerPlaceholder: {
    backgroundColor: colors.white200,
    borderRadius: 8,
  },
});
