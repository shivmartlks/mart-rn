import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { fetchCategories } from "../../services/adminApi";
import Button from "../../components/ui/Button";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await fetchCategories();

    if (error) {
      Alert.alert("Error", "Failed to fetch categories");
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from("product_categories")
      .insert([{ name: newCategory }]);

    if (error) {
      Alert.alert("Error", "Could not add category");
      return;
    }

    setNewCategory("");
    loadCategories();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Category</Text>

      {/* Add Category Box */}
      <View style={styles.card}>
        <TextInput
          placeholder="Category Name"
          value={newCategory}
          onChangeText={setNewCategory}
          style={styles.input}
        />

        <Button block onPress={handleAddCategory}>
          Add Category
        </Button>
      </View>

      {/* Category List */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Existing Categories</Text>

        {loading ? (
          <ActivityIndicator size="small" style={{ marginTop: 10 }} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories yet.</Text>
        ) : (
          categories.map((c) => (
            <View key={c.id} style={styles.listItem}>
              <Text style={styles.listText}>{c.name}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { height: 3 },
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  emptyText: {
    color: "#888",
    marginTop: 5,
  },

  listItem: {
    backgroundColor: "#F7F7F7",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 8,
  },

  listText: {
    fontSize: 16,
    color: "#333",
  },
});
