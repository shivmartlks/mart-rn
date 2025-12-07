import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";

export default function ManageAddresses() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user && isFocused) loadAddresses();
  }, [user, isFocused]);

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
              <Button
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => setDefaultAddress(a.id)}
              >
                Set Default
              </Button>
            )}

            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate("EditAddress", {
                  id: a.id,
                  user: user,
                })
              }
            >
              Edit
            </Button>

            <Button
              variant="secondary"
              style={{ flex: 1, borderColor: "red" }}
              textStyle={{ color: "red" }}
              onPress={() => deleteAddress(a.id)}
            >
              Delete
            </Button>
          </View>
        </View>
      ))}

      {/* Add New Address */}
      <Button block onPress={() => navigation.navigate("AddAddress")}>
        + Add New Address
      </Button>
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
});
