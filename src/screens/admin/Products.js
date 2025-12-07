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

    // Reset form
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Add New Product</Text>

      {/* Add Product Card */}
      <View style={styles.card}>
        {/* Form Inputs */}
        <View style={styles.grid}>
          {[
            { key: "name", placeholder: "Product Name" },
            { key: "description", placeholder: "Description" },
            { key: "mrp", placeholder: "MRP", type: "numeric" },
            { key: "price", placeholder: "Selling Price", type: "numeric" },
            { key: "image_url", placeholder: "Image URL" },
            {
              key: "stock_value",
              placeholder: "Stock Quantity",
              type: "numeric",
            },
          ].map(({ key, placeholder, type }) => (
            <TextInput
              key={key}
              placeholder={placeholder}
              value={newProduct[key]}
              onChangeText={(val) =>
                setNewProduct((p) => ({ ...p, [key]: val }))
              }
              keyboardType={type}
              style={styles.input}
            />
          ))}

          {/* Stock Type Select */}
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

          {/* Group Select */}
          <View style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Select Group:</Text>
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
        </View>

        {/* Add Button */}
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
                <Text style={styles.stockText}>
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

  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { height: 3 },
  },

  grid: {
    gap: 12,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    fontSize: 16,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
  },

  dropdownLabel: {
    marginBottom: 8,
    color: "#555",
    fontSize: 14,
  },

  dropdownText: {
    fontSize: 16,
    color: "#333",
  },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
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
    marginTop: 10,
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
    backgroundColor: "#F7F7F7",
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

  stockText: {
    color: "#777",
    fontSize: 14,
  },
});
