import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

export default function ManageAddresses() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  async function loadAddresses() {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("id", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error) setAddresses(data || []);
  }

  async function setDefaultAddress(id) {
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    loadAddresses();
  }

  async function deleteAddress(id) {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase.from("addresses").delete().eq("id", id);
            loadAddresses();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Manage Addresses</Text>

      {addresses.map((a) => (
        <View key={a.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>{a.label}</Text>
            {a.is_default && <Text style={styles.defaultTag}>Default</Text>}
          </View>

          <Text style={styles.addressText}>{a.address_line}</Text>
          <Text style={styles.subText}>📞 {a.phone}</Text>
          <Text style={styles.subText}>Pincode: {a.pincode}</Text>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            {!a.is_default && (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setDefaultAddress(a.id)}
              >
                <Text style={styles.secondaryText}>Set Default</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                navigation.navigate("EditAddress", {
                  id: a.id,
                  user: user,
                })
              }
            >
              <Text style={styles.secondaryText}>Edit</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { borderColor: "red" }]}
              onPress={() => deleteAddress(a.id)}
            >
              <Text style={[styles.secondaryText, { color: "red" }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Add New Address */}
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate("AddAddress")}
      >
        <Text style={styles.primaryButtonText}>+ Add New Address</Text>
      </Pressable>
    </ScrollView>
  );
}

// 🎨 STYLES ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    textTransform: "capitalize",
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },

  defaultTag: {
    color: "#15803D",
    fontSize: 14,
    fontWeight: "600",
  },

  addressText: {
    marginTop: 6,
    fontSize: 16,
    color: "#333",
  },

  subText: {
    marginTop: 3,
    color: "#666",
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
