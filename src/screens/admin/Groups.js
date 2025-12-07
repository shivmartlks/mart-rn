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
import { fetchGroups, fetchSubCategories } from "../../services/adminApi";

export default function Groups() {
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", subcategoryId: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    await loadSubcategories();
    await loadGroups();
    setLoading(false);
  }

  async function loadSubcategories() {
    const { data, error } = await fetchSubCategories();
    if (error) Alert.alert("Error", "Failed to fetch subcategories");
    else setSubcategories(data || []);
  }

  async function loadGroups() {
    const { data, error } = await fetchGroups();
    if (error) Alert.alert("Error", "Failed to fetch groups");
    else setGroups(data || []);
  }

  async function handleAddGroup() {
    if (!newGroup.name.trim() || !newGroup.subcategoryId) return;

    const { error } = await supabase.from("product_groups").insert([
      {
        name: newGroup.name,
        subcategory_id: newGroup.subcategoryId,
      },
    ]);

    if (error) {
      Alert.alert("Error", "Failed to add group");
      return;
    }

    setNewGroup({ name: "", subcategoryId: "" });
    loadGroups();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Group</Text>

      {/* Add Group Card */}
      <View style={styles.card}>
        {/* Subcategory Dropdown (simple fallback version) */}
        <View style={styles.selectBox}>
          <Text style={styles.label}>Select Subcategory</Text>

          <ScrollView style={{ maxHeight: 150 }}>
            {subcategories.map((sub) => (
              <Pressable
                key={sub.id}
                onPress={() =>
                  setNewGroup((prev) => ({
                    ...prev,
                    subcategoryId: sub.id,
                  }))
                }
                style={[
                  styles.option,
                  newGroup.subcategoryId === sub.id && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    newGroup.subcategoryId === sub.id && styles.optionTextSelected,
                  ]}
                >
                  {sub.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Group Name Input */}
        <TextInput
          placeholder="Group Name"
          value={newGroup.name}
          onChangeText={(val) =>
            setNewGroup((prev) => ({ ...prev, name: val }))
          }
          style={styles.input}
        />

        {/* Add Button */}
        <Pressable style={styles.button} onPress={handleAddGroup}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      {/* Group List */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Existing Groups</Text>

        {groups.length === 0 ? (
          <Text style={styles.emptyText}>No groups added yet.</Text>
        ) : (
          groups.map((g) => {
            const sub = subcategories.find((s) => s.id === g.subcategory_id);
            return (
              <View key={g.id} style={styles.listItem}>
                <Text style={styles.listText}>
                  {g.name}{" "}
                  <Text style={styles.listSubText}>
                    ({sub?.name || "Unassigned"})
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


// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
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

  selectBox: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
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

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
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
    color: "#222",
  },

  listSubText: {
    color: "#777",
    fontSize: 14,
  },
});
