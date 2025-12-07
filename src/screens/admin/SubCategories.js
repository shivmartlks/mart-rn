import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { fetchCategories, fetchSubCategories } from "../../services/adminApi";

export default function SubCategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    categoryId: "",
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await getCategories();
    await getSubCategories();
    setLoading(false);
  }

  async function getCategories() {
    const { data, error } = await fetchCategories();
    if (error) Alert.alert("Error", "Failed to load categories");
    else setCategories(data || []);
  }

  async function getSubCategories() {
    const { data, error } = await fetchSubCategories();
    if (error) Alert.alert("Error", "Failed to load subcategories");
    else setSubcategories(data || []);
  }

  async function handleAddSubcategory() {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      Alert.alert("Missing Fields", "Select category and enter a name.");
      return;
    }

    const { error } = await supabase.from("product_subcategories").insert([
      {
        name: newSubcategory.name,
        category_id: newSubcategory.categoryId,
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // reset & reload
    setNewSubcategory({ name: "", categoryId: "" });
    getSubCategories();
  }

  // ============================= LOADING =============================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  // ============================= CONTENT =============================
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Subcategory</Text>

      {/* Add Subcategory */}
      <View style={styles.card}>
        {/* Category Select */}
        <Text style={styles.dropdownLabel}>Select Category</Text>

        <View style={styles.dropdown}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() =>
                setNewSubcategory((p) => ({ ...p, categoryId: cat.id }))
              }
              style={[
                styles.option,
                newSubcategory.categoryId === cat.id && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  newSubcategory.categoryId === cat.id &&
                    styles.optionTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Input */}
        <TextInput
          placeholder="Subcategory Name"
          value={newSubcategory.name}
          onChangeText={(val) =>
            setNewSubcategory((p) => ({ ...p, name: val }))
          }
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={handleAddSubcategory}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      {/* Existing List */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>All Subcategories</Text>

        {subcategories.length === 0 ? (
          <Text style={styles.emptyText}>No subcategories yet.</Text>
        ) : (
          subcategories.map((s) => {
            const parent = categories.find((c) => c.id === s.category_id);

            return (
              <View key={s.id} style={styles.listItem}>
                <Text style={styles.listText}>
                  {s.name}
                  <Text style={styles.mutedText}>
                    {" "}
                    ({parent?.name || "Unassigned"})
                  </Text>
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

// ============================= STYLES =============================
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    fontSize: 16,
    marginTop: 10,
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  emptyText: {
    color: "#777",
  },

  listItem: {
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 8,
  },

  listText: {
    fontSize: 16,
    color: "#333",
  },

  mutedText: {
    color: "#888",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  dropdownLabel: {
    marginBottom: 8,
    color: "#555",
  },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  optionSelected: {
    backgroundColor: "#000",
  },

  optionText: {
    fontSize: 16,
    color: "#333",
  },

  optionTextSelected: {
    color: "#FFF",
  },
});
