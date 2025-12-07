import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import Button from "../../components/Button/Button";

import { useAuth } from "../../contexts/AuthContext";

export default function AddAddress() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [label, setLabel] = useState("home");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [serviceable, setServiceable] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [isFirstAddress, setIsFirstAddress] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkIfFirstAddress();
  }, []);

  async function checkIfFirstAddress() {
    const { data } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id);

    setIsFirstAddress(!data || data.length === 0);
  }

  async function checkServiceability(pin) {
    if (pin.length !== 6) return;

    const { data } = await supabase
      .from("serviceable_pincodes")
      .select("*")
      .eq("pincode", pin)
      .maybeSingle();

    setServiceable(!!data);
  }

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;

    setCoords({ lat: latitude, lng: longitude });

    // Reverse geocode
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const json = await res.json();

    const fullAddress = json.display_name || "";
    const pin = json.address?.postcode || "";

    setAddress(fullAddress);
    setPincode(pin);
    checkServiceability(pin);
  }

  async function saveAddress() {
    if (!address.trim() || !phone.trim()) {
      Alert.alert("Missing Fields", "Address & Phone are required.");
      return;
    }

    if (serviceable === false) {
      Alert.alert("Not Serviceable", "Delivery is not available in this area.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label,
        address_line: address,
        pincode,
        phone,
        delivery_instructions: instructions,
        latitude: coords.lat,
        longitude: coords.lng,
        is_default: isFirstAddress ? true : isDefault,
      });

      if (error) {
        throw error;
      }

      navigation.navigate("Cart");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Address</Text>

      {/* Use Location */}
      <Button onPress={getCurrentLocation} style={{ marginBottom: 16 }}>
        Use My Current Location
      </Button>

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
        style={styles.inputBox}
        multiline
        value={address}
        onChangeText={setAddress}
      />

      {/* Pincode */}
      <TextInput
        placeholder="Pincode"
        style={styles.inputBox}
        keyboardType="number-pad"
        value={pincode}
        onChangeText={(v) => {
          setPincode(v);
          if (v.length === 6) checkServiceability(v);
        }}
      />

      {/* Serviceability */}
      {serviceable === false && (
        <Text style={styles.errorText}>❌ Delivery not available here</Text>
      )}
      {serviceable === true && (
        <Text style={styles.successText}>✔ Delivery available</Text>
      )}

      {/* Phone */}
      <TextInput
        placeholder="Phone Number"
        style={styles.inputBox}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Instructions */}
      <TextInput
        placeholder="Delivery Instructions (optional)"
        style={styles.inputBox}
        multiline
        value={instructions}
        onChangeText={setInstructions}
      />

      {/* Default Checkbox */}
      {!isFirstAddress && (
        <Button
          variant="ghost"
          style={styles.checkboxRow}
          onPress={() => setIsDefault(!isDefault)}
        >
          <>
            <View
              style={[styles.checkbox, isDefault && styles.checkboxChecked]}
            />
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </>
        </Button>
      )}

      {/* Save Button */}
      <Button block onPress={saveAddress} loading={saving} disabled={saving}>
        Save Address
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

  errorText: {
    color: "#D32F2F",
    marginBottom: 6,
  },
  successText: {
    color: "#15803D",
    marginBottom: 6,
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
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#444",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#000",
  },

  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
});
