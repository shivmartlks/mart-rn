import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/ui/SearchBar";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes, radii } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { IMAGES } from "../../const/imageConst";
import Badge from "../../components/ui/Badge";

export default function Search() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search: trigger 400ms after user stops typing
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

  async function performSearch(q) {
    try {
      setLoading(true);
      // Search by name using case-insensitive ILIKE
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

      setResults(data || []);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => {
    const img = IMAGES.default;
    const price =
      typeof item.price === "number" ? item.price : Number(item.price) || 0;
    const mrp =
      typeof item.mrp === "number" ? item.mrp : Number(item.mrp) || price;
    const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return (
      <Pressable
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        style={{ marginTop: spacing.sm }}
      >
        <Card style={styles.resultCard}>
          <Image source={img} style={styles.resultImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.resultDesc} numberOfLines={1}>
              {item.short_desc || ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", marginLeft: spacing.md }}>
            <Text style={styles.resultPrice}>₹{price}</Text>
            {mrp > price && <Text style={styles.resultMrp}>₹{mrp}</Text>}
            {discount > 0 && (
              <Badge
                size="sm"
                variant="success"
                label={`${discount}% OFF`}
                style={styles.discountBadge}
              />
            )}
          </View>
        </Card>
      </Pressable>
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
            numColumns={3}
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
  headerArea: {
    padding: spacing.md,
    backgroundColor: colors.screenBG,
  },
  resultsArea: { flex: 1, paddingHorizontal: spacing.md },
  emptyCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: colors.textSecondary, fontSize: textSizes.md },
  resultCard: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: spacing.sm,
    borderRadius: radii.md,
    flexBasis: "31%",
    maxWidth: "31%",
    minWidth: "140",
    backgroundColor: colors.cardSoft || colors.cardBG,
  },
  resultImage: {
    width: "100%",
    height: 100,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white200,
  },
  resultTitle: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  resultDesc: {
    fontSize: textSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultPrice: {
    fontSize: textSizes.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  resultMrp: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  discountBadge: { marginTop: spacing.xs },
  columnWrapper: { justifyContent: "space-between", marginBottom: spacing.sm },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loadingText: { marginLeft: spacing.sm, color: colors.textSecondary },
});
