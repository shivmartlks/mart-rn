import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";

import { useAuth } from "../../contexts/AuthContext";

// UI Components (your new design system)
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ListTile from "../../components/ui/ListTile";
import Divider from "../../components/ui/Divider";

import { colors, spacing, textSizes, fontWeights, radii } from "../../theme";

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

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const json = await res.json();

    setAddress(json.display_name || "");
    const pin = json.address?.postcode || "";
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

      if (error) throw error;

      navigation.navigate("Cart");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        padding: spacing.lg,
      }}
    >
      {/* TITLE */}
      <Text
        style={{
          fontSize: textSizes.xl,
          fontWeight: fontWeights.semibold,
          marginBottom: spacing.lg,
          color: colors.textPrimary,
        }}
      >
        Add Address
      </Text>

      {/* USE CURRENT LOCATION */}
      <Card elevated style={{ marginBottom: spacing.lg }}>
        <Button
          size="lg"
          onPress={getCurrentLocation}
          style={{ marginBottom: spacing.sm }}
        >
          Use My Current Location
        </Button>
      </Card>

      {/* MAIN FORM CARD */}
      <Card elevated style={{ marginBottom: spacing.xl }}>
        {/* LABEL PICKER */}
        <View
          style={{
            padding: spacing.md,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.md,
          }}
        >
          <Picker
            selectedValue={label}
            onValueChange={setLabel}
            dropdownIconColor={colors.textPrimary}
            style={{ color: colors.textPrimary }}
          >
            <Picker.Item label="Home" value="home" />
            <Picker.Item label="Office" value="office" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/* ADDRESS INPUTS */}
        <Input
          placeholder="Full Address"
          value={address}
          onChangeText={setAddress}
          size="lg"
          multiline
          style={{ marginBottom: spacing.md }}
        />

        <Input
          placeholder="Pincode"
          value={pincode}
          keyboardType="number-pad"
          onChangeText={(v) => {
            setPincode(v);
            if (v.length === 6) checkServiceability(v);
          }}
          size="md"
          style={{ marginBottom: spacing.sm }}
        />

        {/* SERVICEABILITY MESSAGE */}
        {serviceable === true && (
          <Text style={{ color: colors.success, marginBottom: spacing.sm }}>
            ✔ Delivery available
          </Text>
        )}
        {serviceable === false && (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            ❌ Delivery not available here
          </Text>
        )}

        <Input
          placeholder="Phone Number"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
          size="md"
          style={{ marginBottom: spacing.md }}
        />

        <Input
          placeholder="Delivery Instructions (optional)"
          value={instructions}
          onChangeText={setInstructions}
          size="lg"
          multiline
          style={{ marginBottom: spacing.lg }}
        />

        {/* DEFAULT ADDRESS CHECKBOX */}
        {!isFirstAddress && (
          <ListTile
            title="Set as default address"
            left={
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: colors.textPrimary,
                  backgroundColor: isDefault
                    ? colors.textPrimary
                    : "transparent",
                }}
              />
            }
            onPress={() => setIsDefault(!isDefault)}
            style={{
              paddingVertical: spacing.md,
            }}
          />
        )}
      </Card>

      {/* SAVE BUTTON */}
      <Button
        block
        size="lg"
        loading={saving}
        disabled={saving}
        onPress={saveAddress}
      >
        Save Address
      </Button>
    </ScrollView>
  );
}
