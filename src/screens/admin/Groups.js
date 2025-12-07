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
    if (!newGroup.name.trim() || !newGroup.subcategoryId) {
      Alert.alert("Missing Fields", "Select subcategory and enter a name.");
      return;
    }

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

  // ------------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  // ------------------------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Group</Text>

      {/* Add Group Card */}
      <View style={styles.card}>
        {/* Subcategory Dropdown */}
        <Text style={styles.dropdownLabel}>Select Subcategory</Text>

        <View style={styles.dropdown}>
          {subcategories.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() =>
                setNewGroup((prev) => ({ ...prev, subcategoryId: sub.id }))
              }
              style={[
                styles.option,
                newGroup.subcategoryId === sub.id && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  newGroup.subcategoryId === sub.id &&
                    styles.optionTextSelected,
                ]}
              >
                {sub.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Input Name */}
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

// ============================================================
// STYLES
// ============================================================
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
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 20,
  },

  dropdownLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
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
    backgroundColor: "#FAFAFA",
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

  listSubText: {
    color: "#777",
    fontSize: 14,
  },
});
