import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";
import { getProfile } from "../../services/profileService";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/Button/Button";

export default function Profile() {
  const navigation = useNavigation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile(); // same API call you use on web
    setProfile(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    Alert.alert("Logged Out", "You have been logged out.");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading profile...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Dropdown Menu */}
      <View style={styles.contentWrapper}>
        <Button
          variant="ghost"
          onPress={() => navigation.navigate("EditProfile")}
        >
          Edit Profile
        </Button>
        <Button variant="ghost" onPress={() => navigation.navigate("Orders")}>
          Orders
        </Button>
        <Button variant="ghost" onPress={handleLogout}>
          Logout
        </Button>
      </View>

      {/* Profile Content */}
      <View style={styles.contentWrapper}>
        <Text style={styles.header}>My Profile</Text>

        <View style={styles.card}>
          <Text style={styles.row}>
            <Text style={styles.label}>Name: </Text>
            {profile.name || "Not set"}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.label}>Email: </Text>
            {profile.email}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.label}>Phone: </Text>
            {profile.phone || "Not set"}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.label}>Pincode: </Text>
            {profile.pincode || "Not set"}
          </Text>
        </View>

        {/* Buttons */}
        <Button
          block
          onPress={() => navigation.navigate("EditProfile")}
          style={{ marginBottom: 12 }}
        >
          Edit Profile
        </Button>

        <Button
          block
          variant="secondary"
          onPress={() => navigation.navigate("ManageAddresses")}
        >
          Manage Addresses
        </Button>
      </View>
    </ScrollView>
  );
}

// 🎨 STYLES ------------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  contentWrapper: {
    padding: 16,
  },

  header: {
    fontSize: 22,
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

  row: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },

  label: {
    color: "#777",
    fontWeight: "600",
  },
});
