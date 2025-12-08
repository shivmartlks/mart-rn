import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { colors, textSizes, radius } from "../../Theme/theme";

export default function Shop() {
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

  function renderSubcategoryItem(sub) {
    return (
      <Pressable
        key={sub.id}
        onPress={() => navigation.navigate("ProductView", { id: sub.id })}
        style={styles.subItem}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: sub.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.subName}>{sub.name}</Text>
      </Pressable>
    );
  }

  function renderCategory({ item: cat }) {
    const catSubs = subcategories.filter((s) => s.category_id === cat.id);

    return (
      <View key={cat.id} style={styles.categoryBox}>
        <Text style={styles.categoryName}>{cat.name}</Text>

        {catSubs.length === 0 ? (
          <Text style={styles.noSubs}>No subcategories yet</Text>
        ) : (
          <View style={styles.grid}>
            {catSubs.map((sub) => renderSubcategoryItem(sub))}
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

// 🔥 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  categoryBox: {
    marginBottom: 16,
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black800,
    marginBottom: 4,
  },

  noSubs: {
    fontSize: 12,
    color: colors.black500,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },

  subItem: {
    width: "25%",
    padding: 4,
    alignItems: "center",
  },

  imageContainer: {
    backgroundColor: colors.white50,
    borderColor: colors.gray200,
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    overflow: "hidden",
    marginBottom: 2,
    height: 80,
    padding: 8,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },

  subName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.black800,
    marginTop: 2,
    textAlign: "center",
  },
});
