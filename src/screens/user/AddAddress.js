import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";

// UI Components (your new design system)
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ListTile from "../../components/ui/ListTile";
import Divider from "../../components/ui/Divider";
import Chip from "../../components/ui/Chip";
import { Feather } from "@expo/vector-icons";

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
  const [errors, setErrors] = useState({ address: "", pincode: "", phone: "" });
  const [hasLocation, setHasLocation] = useState(false);

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
    setHasLocation(true); // update immediately so the UI switches from the pre-fetch message

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "mart-rn-app/1.0 (tejendra@example.com)",
            Accept: "application/json",
          },
        }
      );
      const json = await res.json();

      const display = json?.display_name || "";
      const pin = json?.address?.postcode || "";

      setAddress(display);
      setPincode(pin);
      if (pin) checkServiceability(pin);

      // clear any prior errors for autofilled fields
      setErrors((prev) => ({ ...prev, address: "", pincode: "" }));
    } catch (e) {
      // keep hasLocation true; user can still input manually
    }
  }

  function validateFields() {
    const next = { address: "", pincode: "", phone: "" };
    if (!hasLocation)
      next.address = "Please use current location to autofill address";
    if (!address.trim())
      next.address = next.address || "Full Address is required";
    if (!pincode.trim()) next.pincode = "Pincode is required";
    else if (pincode.length !== 6) next.pincode = "Pincode must be 6 digits";
    if (!phone.trim()) next.phone = "Phone number is required";
    else if (phone.length < 10) next.phone = "Enter a valid phone number";
    setErrors(next);
    return !next.address && !next.pincode && !next.phone;
  }

  async function saveAddress() {
    // Inline validation without alerts
    if (!validateFields()) return;
    if (serviceable === false) {
      setErrors((e) => ({
        ...e,
        pincode: "Delivery not available in this area",
      }));
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

      // Navigate to Cart tab inside UserTabs
      navigation.navigate("UserTabs", { screen: "Cart" });
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        {/* USE CURRENT LOCATION */}
        <Card elevated style={{ marginBottom: spacing.lg }}>
          <Button
            size="lg"
            onPress={getCurrentLocation}
            style={{ marginBottom: spacing.sm }}
          >
            Use My Current Location
          </Button>
          {hasLocation ? (
            // Show transitional message while reverse-geocoding fills the address
            address ? (
              <View style={{ marginTop: spacing.sm }}>
                <Text
                  style={{ color: colors.textPrimary, fontSize: textSizes.sm }}
                >
                  Fetched Address:
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: textSizes.sm,
                  }}
                >
                  {address}
                </Text>
                {pincode ? (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: textSizes.sm,
                    }}
                  >
                    Pincode: {pincode}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                Fetching address from location...
              </Text>
            )
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              You must fetch your location before saving.
            </Text>
          )}
        </Card>

        {/* MAIN FORM CARD */}
        <Card elevated style={{ marginBottom: spacing.xl }}>
          {/* ADDRESS INPUTS */}
          {hasLocation && (
            <Input
              label="Detected Location"
              placeholder="Location will appear here"
              value={address}
              editable={false}
              size="md"
              helper="Auto-fetched from your current location"
              style={{ marginBottom: spacing.md }}
            />
          )}

          <Input
            label="Full Address"
            placeholder="House no, street, area"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors({ ...errors, address: "" });
            }}
            size="lg"
            multiline
            style={{ marginBottom: spacing.sm }}
            error={errors.address}
          />

          <Input
            label="Pincode"
            placeholder="e.g. 560001"
            value={pincode}
            keyboardType="number-pad"
            onChangeText={(v) => {
              setPincode(v);
              if (v.length === 6) checkServiceability(v);
              if (errors.pincode) setErrors({ ...errors, pincode: "" });
            }}
            size="md"
            style={{ marginBottom: spacing.xs }}
            error={errors.pincode}
            maxLength={6}
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
            label="Phone Number"
            placeholder="e.g. 9876543210"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={(v) => {
              setPhone(v);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            size="md"
            style={{ marginBottom: spacing.sm }}
            error={errors.phone}
            maxLength={10}
          />

          <Input
            label="Delivery Instructions (optional)"
            placeholder="Any notes for the rider"
            value={instructions}
            onChangeText={setInstructions}
            size="lg"
            multiline
          />

          {/* DEFAULT ADDRESS TOGGLE */}
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
              style={{ paddingVertical: spacing.md }}
            />
          )}

          {/* LABEL SELECTION VIA CHIPS WITH ICONS (HOME/OFFICE/OTHER) */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: spacing.sm,
            }}
          >
            <Chip
              size="sm"
              label="Home"
              selected={label === "home"}
              leftIcon={
                <Feather
                  name="home"
                  size={16}
                  color={
                    label === "home" ? colors.primary : colors.textSecondary
                  }
                />
              }
              onPress={() => setLabel("home")}
            />
            <Chip
              size="sm"
              label="Office"
              selected={label === "office"}
              leftIcon={
                <Feather
                  name="briefcase"
                  size={16}
                  color={
                    label === "office" ? colors.primary : colors.textSecondary
                  }
                />
              }
              onPress={() => setLabel("office")}
            />
            <Chip
              size="sm"
              label="Other"
              selected={label === "other"}
              leftIcon={
                <Feather
                  name="map-pin"
                  size={16}
                  color={
                    label === "other" ? colors.primary : colors.textSecondary
                  }
                />
              }
              onPress={() => setLabel("other")}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: colors.cardBG,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
        >
          <Button
            block
            size="lg"
            loading={saving}
            disabled={saving || !hasLocation}
            onPress={saveAddress}
          >
            Save Address
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
