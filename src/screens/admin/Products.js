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
import { fetchGroups, fetchProducts } from "../../services/adminApi";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    image_url: "",
    stock_value: "",
    stock_type: "quantity",
    stock_unit: "pcs",
    group_id: "",
  });

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    await loadGroups();
    await loadProducts();
    setLoading(false);
  }

  async function loadGroups() {
    const { data, error } = await fetchGroups();
    if (error) Alert.alert("Error", "Failed to fetch groups");
    else setGroups(data || []);
  }

  async function loadProducts() {
    const { data, error } = await fetchProducts();
    if (error) Alert.alert("Error", "Failed to fetch products");
    else setProducts(data || []);
  }

  async function handleAddProduct() {
    const {
      name,
      description,
      mrp,
      price,
      image_url,
      stock_value,
      stock_type,
      stock_unit,
      group_id,
    } = newProduct;

    if (!name || !price || !group_id) {
      Alert.alert("Missing Fields", "Name, Price & Group are required.");
      return;
    }

    const payload = {
      name,
      description,
      mrp: Number(mrp) || Number(price),
      price: Number(price),
      image_url,
      stock_value: Number(stock_value) || 0,
      stock_type,
      stock_unit,
      group_id,
    };

    const { error } = await supabase.from("products").insert([payload]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // reset
    setNewProduct({
      name: "",
      description: "",
      mrp: "",
      price: "",
      image_url: "",
      stock_value: "",
      stock_type: "quantity",
      stock_unit: "pcs",
      group_id: "",
    });

    loadProducts();
  }

  // ----------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  // ----------------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      {/* Add Product Card */}
      <View style={styles.card}>
        {/* Name */}
        <TextInput
          placeholder="Product Name"
          value={newProduct.name}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, name: v }))}
          style={styles.input}
        />

        {/* Description */}
        <TextInput
          placeholder="Description"
          value={newProduct.description}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, description: v }))}
          style={styles.input}
        />

        {/* MRP */}
        <TextInput
          placeholder="MRP"
          keyboardType="numeric"
          value={newProduct.mrp}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, mrp: v }))}
          style={styles.input}
        />

        {/* Price */}
        <TextInput
          placeholder="Selling Price"
          keyboardType="numeric"
          value={newProduct.price}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, price: v }))}
          style={styles.input}
        />

        {/* Image URL */}
        <TextInput
          placeholder="Image URL"
          value={newProduct.image_url}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, image_url: v }))}
          style={styles.input}
        />

        {/* Stock Value */}
        <TextInput
          placeholder="Stock Quantity"
          keyboardType="numeric"
          value={newProduct.stock_value}
          onChangeText={(v) => setNewProduct((p) => ({ ...p, stock_value: v }))}
          style={styles.input}
        />

        {/* Stock Type Toggle */}
        <Pressable
          style={styles.dropdown}
          onPress={() =>
            setNewProduct((prev) => ({
              ...prev,
              stock_type:
                prev.stock_type === "quantity" ? "weight" : "quantity",
            }))
          }
        >
          <Text style={styles.dropdownText}>
            {newProduct.stock_type === "quantity"
              ? "Quantity (pcs)"
              : "Weight (kg)"}
          </Text>
        </Pressable>

        {/* Group Dropdown */}
        <Text style={styles.dropdownLabel}>Select Group</Text>
        <View style={styles.dropdownBox}>
          <ScrollView style={{ maxHeight: 150 }}>
            {groups.map((g) => (
              <Pressable
                key={g.id}
                onPress={() =>
                  setNewProduct((prev) => ({ ...prev, group_id: g.id }))
                }
                style={[
                  styles.option,
                  newProduct.group_id === g.id && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    newProduct.group_id === g.id && styles.optionTextSelected,
                  ]}
                >
                  {g.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Add Product Button */}
        <Pressable style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </Pressable>
      </View>

      {/* Product List */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>All Products</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products available.</Text>
        ) : (
          products.map((p) => (
            <View key={p.id} style={styles.listItem}>
              <Text style={styles.listText}>
                {p.name} — ₹{p.price}{" "}
                <Text style={styles.listSubText}>
                  ({p.stock_value} {p.stock_unit})
                </Text>
              </Text>
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
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  dropdownLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: "#555",
    fontSize: 14,
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    overflow: "hidden",
  },

  dropdown: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  dropdownText: {
    fontSize: 16,
    color: "#333",
  },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 10,
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

  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  emptyText: {
    color: "#999",
  },

  listItem: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  listText: {
    fontSize: 16,
    color: "#333",
  },

  listSubText: {
    color: "#777",
    fontSize: 14,
  },
});
