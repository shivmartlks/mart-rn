import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Linking } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes } from "../../theme";
import { supabase, SUPABASE_URL } from "../../services/supabase";
import { getRecentlyViewedIds } from "../../services/recentlyViewed";
import {
  RECENTLY_VIEWED_MAX,
  POPULAR_PRODUCTS_MAX,
  FEATURED_CATEGORIES_MAX,
} from "../../const/listConfig";
import { fetchHomeBanners } from "../../api/storeApi";
import SearchCard from "./home/SearchCard";
import BannerCarousel from "./home/BannerCarousel";
import CategoriesHorizontal from "./home/CategoriesHorizontal";
import ProductCardsHorizontal from "./home/ProductCardsHorizontal";

export default function Home() {
  const navigation = useNavigation();
  const { homeAlert } = useActiveStore();
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchFeatured();
    fetchPopular();
    fetchBanners();
  }, []);

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
          const num = Number(linkValue);
          linkValue = Number.isFinite(num) ? num : String(linkValue);
        } else if (linkType === "subcategory") {
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .limit(RECENTLY_VIEWED_MAX);
      if (error || !Array.isArray(data)) {
        setRecentProducts([]);
        return;
      }
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

  const handleBannerPress = (item) => {
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
            navigation.navigate("Products", { id: item.link_value });
          break;

        case "subcategory":
          if (item.link_value)
            navigation.navigate("Products", { id: item.link_value });
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
            } else if (typeof item.link_value === "string" && item.link_value) {
              navigation.navigate(item.link_value);
            }
          }
          break;

        case "external":
        case "url":
          if (typeof item.link_value === "string")
            Linking.openURL(item.link_value).catch(() => {});
          break;

        case "none":
          break;

        default:
          break;
      }
    } catch (e) {}
  };

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

      {/* Search */}
      <SearchCard onPress={() => navigation.navigate("Search")} />

      {/* Banners */}
      <BannerCarousel banners={banners} onBannerPress={handleBannerPress} />

      {/* Featured Categories - horizontal list, hidden if none */}
      <CategoriesHorizontal
        title="Featured Categories"
        categories={featuredCategories}
        onPressCategory={(item) =>
          navigation.navigate("Products", { id: item.id, name: item.name })
        }
      />

      {/* Popular Products - horizontal list, hidden if none */}
      <ProductCardsHorizontal
        title="Popular Products"
        products={featuredProducts}
        onPressItem={(item) =>
          navigation.navigate("ProductDetails", {
            product: item,
            productId: item.id,
          })
        }
      />

      {/* Recently Viewed - horizontal list, hidden if none */}
      <ProductCardsHorizontal
        title="Recently Viewed"
        products={recentProducts}
        onPressItem={(item) =>
          navigation.navigate("ProductDetails", {
            product: item,
            productId: item.id,
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
    paddingVertical: spacing.md,
  },
});
