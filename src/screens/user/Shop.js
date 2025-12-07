import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/Button/Button";

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
      <Button
        key={sub.id}
        onPress={() => navigation.navigate("ProductView", { id: sub.id })}
        variant="ghost"
        style={styles.subItem}
        textStyle={styles.subName}
      >
        <>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: sub.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          {sub.name}
        </>
      </Button>
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
    backgroundColor: "#F5F5F5",
  },

  categoryBox: {
    marginBottom: 28,
  },

  categoryName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
  },

  noSubs: {
    fontSize: 14,
    color: "#777",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  subItem: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 16,
    padding: 0,
    height: "auto",
    minHeight: 0,
  },

  imageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    marginBottom: 8,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  subName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
