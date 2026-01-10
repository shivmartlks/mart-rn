import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/ui/SearchBar";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes, radii } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import ProductCard from "./common/productCard";

export default function Search() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const handle = setTimeout(() => {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }
      performSearch(q);
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  async function fetchProductImagesMap(productIds) {
    const ids = Array.isArray(productIds)
      ? Array.from(new Set(productIds))
      : [];
    if (ids.length === 0) return {};
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .in("product_id", ids)
      .order("sort_order", { ascending: true });
    if (error || !Array.isArray(data)) return {};
    try {
      console.log(
        "[Search] product_images rows",
        data.length,
        data.slice(0, 3)
      );
    } catch {}
    const map = {};
    (data || []).forEach((row) => {
      const pid = row.product_id ?? row.productId ?? row.product ?? null;
      const uri =
        row.image_url ||
        row.url ||
        row.path ||
        row.uri ||
        row.file_path ||
        row.image ||
        row.src ||
        "";
      if (!pid) return;
      if (!map[pid]) map[pid] = [];
      if (uri) map[pid].push({ uri });
    });
    return map;
  }

  async function performSearch(q) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, mrp, short_desc")
        .ilike("name", `%${q}%`)
        .limit(40);
      if (error) {
        console.error("Search failed", error);
        setResults([]);
        setLoading(false);
        return;
      }

      const items = data || [];
      const ids = items.map((x) => x.id);

      // Attach inventory
      let invMap = {};
      if (ids.length) {
        const { data: invRows } = await supabase
          .from("store_inventory")
          .select("product_id, stock_value")
          .in("product_id", ids);
        (invRows || []).forEach((r) => (invMap[r.product_id] = r.stock_value));
      }

      // Attach first images
      const imagesMap = await fetchProductImagesMap(ids);
      try {
        console.log("[Search] imagesMap", imagesMap);
      } catch {}
      const final = items.map((x) => ({
        ...x,
        _stock_value: invMap[x.id] ?? 0,
        images: imagesMap[x.id] || [],
      }));
      try {
        console.log(
          "[Search] results with images",
          final.map((p) => ({
            id: p.id,
            imagesLen: Array.isArray(p.images) ? p.images.length : 0,
            first: p.images?.[0]?.uri,
          }))
        );
      } catch {}

      setResults(final);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => {
    const isOutOfStock = (item._stock_value ?? 0) <= 0;
    return (
      <ProductCard
        product={item}
        qty={0}
        onPress={() =>
          navigation.navigate("ProductDetails", {
            product: item,
            productId: item.id,
          })
        }
        showQuantityControls={!isOutOfStock}
        showStockOverlays={true}
        style={{ flexBasis: "48%", maxWidth: "48%" }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerArea}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search for products, brands…"
          autoFocus={true}
        />
      </View>

      <View style={styles.resultsArea}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length === 0 && query.trim() !== "" ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No results</Text>
          </Card>
        ) : results.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Start typing to search</Text>
          </Card>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenBG },
  headerArea: { padding: spacing.md, backgroundColor: colors.screenBG },
  resultsArea: { flex: 1, paddingHorizontal: spacing.md },
  emptyCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: colors.textSecondary, fontSize: textSizes.md },
  columnWrapper: { justifyContent: "space-between", marginBottom: spacing.sm },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loadingText: { marginLeft: spacing.sm, color: colors.textSecondary },
});
