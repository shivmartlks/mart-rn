import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showSuccess } from "../../utils/toastUtils";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import FormRow from "../../components/ui/FormRow";
import ListTile from "../../components/ui/ListTile";
import Switch from "../../components/ui/Switch";
import Chip from "../../components/ui/Chip";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, textSizes } from "../../theme";

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
  const [errors, setErrors] = useState({ address: "", pincode: "", phone: "" });
  const [original, setOriginal] = useState({
    label: "home",
    address: "",
    phone: "",
    pincode: "",
    instructions: "",
    isDefault: false,
  });

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
      alert("Failed to load address.");
      return;
    }

    setLabel(data.label);
    setAddress(data.address_line);
    setPhone(data.phone);
    setPincode(data.pincode);
    setInstructions(data.delivery_instructions || "");
    setIsDefault(data.is_default);

    // store original snapshot for dirty check
    setOriginal({
      label: data.label,
      address: data.address_line,
      phone: data.phone,
      pincode: data.pincode,
      instructions: data.delivery_instructions || "",
      isDefault: data.is_default,
    });

    setLoading(false);
  }

  function validateFields() {
    const next = { address: "", pincode: "", phone: "" };
    if (!address.trim()) next.address = "Full Address is required";
    if (!pincode.trim()) next.pincode = "Pincode is required";
    else if (pincode.length !== 6) next.pincode = "Pincode must be 6 digits";
    if (!phone.trim()) next.phone = "Phone number is required";
    else if (phone.length < 10) next.phone = "Enter a valid phone number";
    setErrors(next);
    return !next.address && !next.pincode && !next.phone;
  }

  // derived dirty flag
  const isDirty =
    label !== original.label ||
    address !== original.address ||
    phone !== original.phone ||
    pincode !== original.pincode ||
    instructions !== original.instructions ||
    isDefault !== original.isDefault;

  async function save() {
    // guard: avoid unnecessary calls
    if (!isDirty) return;
    if (!validateFields()) return;
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

      showSuccess("Address updated", "Your changes have been saved.");
      navigation.navigate("ManageAddresses");
    } catch (err) {
      // keep inline errors, avoid alerts
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading address...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* LABEL SELECTION VIA CHIPS WITH ICONS (HOME/OFFICE/OTHER) */}
        <Card style={{ marginBottom: spacing.lg }}>
          <FormRow label="Label">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Chip
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
          </FormRow>
        </Card>

        {/* ADDRESS FIELDS */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Input
            label="Full Address"
            placeholder="House no, street, area"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors({ ...errors, address: "" });
            }}
            multiline
            style={{ marginBottom: spacing.md }}
            error={errors.address}
          />

          <FormRow label="Pincode" style={{ marginBottom: spacing.md }}>
            <Input
              placeholder="e.g. 560001"
              value={pincode}
              onChangeText={(v) => {
                setPincode(v);
                if (errors.pincode) setErrors({ ...errors, pincode: "" });
              }}
              keyboardType="number-pad"
              error={errors.pincode}
              maxLength={6}
            />
          </FormRow>

          <FormRow label="Phone" style={{ marginBottom: spacing.md }}>
            <Input
              placeholder="e.g. 9876543210"
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              keyboardType="phone-pad"
              error={errors.phone}
              maxLength={10}
            />
          </FormRow>

          <Input
            label="Delivery Instructions (optional)"
            placeholder="Any notes for the rider"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </Card>

        {/* DEFAULT ADDRESS TOGGLE */}
        <Card style={{ marginBottom: spacing.lg }}>
          <ListTile
            title="Set as default address"
            right={
              <Switch
                value={isDefault}
                onChange={(v) => {
                  if (totalAddresses === 1) return; // cannot unset single address
                  setIsDefault(v);
                }}
                disabled={totalAddresses === 1}
              />
            }
          />
          {totalAddresses === 1 ? (
            <Text style={styles.note}>
              You must have at least one address. This address stays default.
            </Text>
          ) : null}
        </Card>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footerInner}>
          <Button
            block
            onPress={save}
            loading={saving}
            disabled={!isDirty || saving}
          >
            Save Changes
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

// 🎨 STYLES ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
  },
  content: {
    padding: spacing.lg,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  note: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
    backgroundColor: colors.screenBG,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.screenBG,
  },
  footerSafeArea: {
    backgroundColor: colors.cardBG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBG,
  },
});
