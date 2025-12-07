import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getProfile, updateProfile } from "../../services/profileService";
import Button from "../../components/Button/Button";

export default function EditProfile() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const profile = await getProfile();

      if (profile) {
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setPincode(profile.pincode || "");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateProfile({ name, phone, pincode });

      Alert.alert("Success", "Profile updated successfully");
      navigation.navigate("Profile");
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      <View style={styles.card}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Primary phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Pincode */}
        <View style={styles.field}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 334603"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Button
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={{ flex: 1 }}
          >
            Save Changes
          </Button>

          <Button
            variant="secondary"
            onPress={() => navigation.navigate("Profile")}
            disabled={saving}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
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
  },

  field: {
    marginBottom: 14,
  },

  label: {
    color: "#777",
    fontSize: 14,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});
