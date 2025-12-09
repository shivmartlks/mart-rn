import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/ui/Button";

export default function SelectAddress({ user, selectedAddress, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  async function loadAddresses() {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    setAddresses(data || []);

    // Auto-select default address
    const defaultAddr = data?.find((a) => a.is_default);
    if (defaultAddr && !selectedAddress) {
      onSelect(defaultAddr.id);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <ScrollView style={{ marginBottom: 10 }}>
        {addresses.map((addr) => {
          const isSelected = selectedAddress === addr.id;

          return (
            <Button
              key={addr.id}
              onPress={() => onSelect(addr.id)}
              variant="ghost"
              style={[styles.card, isSelected && styles.cardActive]}
            >
              <>
                {/* Radio Button */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                {/* Address Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{addr.label}</Text>
                  <Text style={styles.address}>{addr.address_line}</Text>
                  <Text style={styles.sub}>📞 {addr.phone}</Text>
                </View>
              </>
            </Button>
          );
        })}
      </ScrollView>

      {/* Add New Address */}
      <Button block onPress={() => navigation.navigate("AddAddress")}>
        + Add New Address
      </Button>
    </View>
  );
}

// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },

  cardActive: {
    borderColor: "#000",
    backgroundColor: "#F8F8F8",
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  radioOuterActive: {
    borderColor: "#000",
  },

  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: "#000",
    borderRadius: 6,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
    color: "#222",
    marginBottom: 2,
  },

  address: {
    fontSize: 14,
    color: "#333",
  },

  sub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
