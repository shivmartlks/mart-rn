import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";

import Button from "../../components/ui/Button";
export default function EditAddress() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, user } = route.params;

  const [label, setLabel] = useState("home");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCount();
    loadAddress();
  }, [id, user.id]);

  async function loadCount() {
    const { data } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id);

    setTotalAddresses(data?.length || 0);
  }

  async function loadAddress() {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load address.");
      return;
    }

    setLabel(data.label);
    setAddress(data.address_line);
    setPhone(data.phone);
    setPincode(data.pincode);
    setInstructions(data.delivery_instructions || "");
    setIsDefault(data.is_default);

    setLoading(false);
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("addresses")
        .update({
          label,
          address_line: address,
          phone,
          pincode,
          delivery_instructions: instructions,
          is_default: isDefault,
        })
        .eq("id", Number(id));

      if (error) throw error;

      Alert.alert("Success", "Address updated!");
      navigation.navigate("ManageAddresses");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update address.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading address...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Address</Text>

      {/* Label Picker */}
      <View style={styles.pickerBox}>
        <Picker selectedValue={label} onValueChange={(v) => setLabel(v)}>
          <Picker.Item label="Home" value="home" />
          <Picker.Item label="Office" value="office" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Address */}
      <TextInput
        placeholder="Full Address"
        value={address}
        onChangeText={setAddress}
        multiline
        style={styles.inputBox}
      />

      {/* Pincode */}
      <TextInput
        placeholder="Pincode"
        value={pincode}
        onChangeText={setPincode}
        keyboardType="number-pad"
        style={styles.inputBox}
      />

      {/* Phone */}
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.inputBox}
      />

      {/* Instructions */}
      <TextInput
        placeholder="Delivery instructions (optional)"
        value={instructions}
        onChangeText={setInstructions}
        multiline
        style={styles.inputBox}
      />

      {/* Default Address Checkbox */}
      <Button
        variant="ghost"
        style={styles.checkboxRow}
        onPress={() => {
          if (totalAddresses === 1) return;
          setIsDefault(!isDefault);
        }}
      >
        <>
          <View
            style={[
              styles.checkbox,
              isDefault && styles.checkboxChecked,
              totalAddresses === 1 && { opacity: 0.5 },
            ]}
          />
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </>
      </Button>

      {/* Save Button */}
      <Button block onPress={save} loading={saving} disabled={saving}>
        Save Changes
      </Button>
    </ScrollView>
  );
}

// 🎨 STYLES ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  pickerBox: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 12,
  },

  inputBox: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    marginBottom: 12,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "flex-start",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: "#000",
  },

  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
});
