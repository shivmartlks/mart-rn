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
      <View style={styles.menuBox}>
        <Pressable
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.menuItem}
        >
          <Text style={styles.menuText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Orders")}
          style={styles.menuItem}
        >
          <Text style={styles.menuText}>Orders</Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={styles.logoutItem}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
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
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("ManageAddresses")}
        >
          <Text style={styles.secondaryButtonText}>Manage Addresses</Text>
        </Pressable>
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

  menuBox: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    overflow: "hidden",
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    color: "#222",
    fontSize: 16,
  },

  logoutItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "600",
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

  primaryButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "600",
  },
});
