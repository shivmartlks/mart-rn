import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import SectionTitle from "../../components/ui/SectionTitle";
import Chip from "../../components/ui/Chip";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { IMAGES } from "../../const/imageConst";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: categoriesData } = await supabase
      .from("product_categories")
      .select("*")
      .order("name");
    const { data: subcategoriesData } = await supabase
      .from("product_subcategories")
      .select("*")
      .order("name");
    setCategories(categoriesData || []);
    setSubcategories(subcategoriesData || []);
  }

  const renderSubcategoryItem = (sub) => {
    const isValidImage =
      sub.image_url &&
      typeof sub.image_url === "string" &&
      sub.image_url.startsWith("http");
    const imgSource = isValidImage
      ? { uri: encodeURI(sub.image_url) }
      : IMAGES.default;
    return (
      <Pressable
        key={sub.id}
        onPress={() =>
          navigation.navigate("Products", { id: sub.id, name: sub.name })
        }
        style={styles.subItem}
      >
        <View style={styles.imageContainer}>
          <Image source={imgSource} style={styles.image} resizeMode="cover" />
        </View>
        <Text style={styles.subName}>{sub.name}</Text>
      </Pressable>
    );
  };

  const renderCategory = ({ item: cat }) => {
    const catSubs = subcategories.filter((s) => s.category_id === cat.id);
    return (
      <View style={{ marginBottom: spacing.md }}>
        <SectionTitle title={cat.name} />
        {catSubs.length === 0 ? (
          <Text style={styles.noSubs}>No subcategories yet</Text>
        ) : (
          <View style={styles.grid}>
            {catSubs.map((sub) => renderSubcategoryItem(sub))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Optional filters placeholder using Chips */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: spacing.md,
        }}
      >
        <Chip label="All" selected />
        <Chip label="Popular" />
        <Chip label="Newest" />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenBG },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  subItem: {
    width: "25%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: colors.white200, // ensure visible background behind images
    borderRadius: 12,
    width: "100%",
    overflow: "hidden",
    marginBottom: spacing.xs,
    height: 92,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm, // add inner padding around the image
  },
  image: { width: "100%", height: "100%" },
  subName: {
    fontSize: textSizes.sm, // increased font size
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
  noSubs: { fontSize: textSizes.sm, color: colors.textSecondary },
});
