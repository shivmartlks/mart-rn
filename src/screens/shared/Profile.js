import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { getProfile } from "../../services/profileService";
import { useNavigation } from "@react-navigation/native";

import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import ListTile from "../../components/ui/ListTile";
import Divider from "../../components/ui/Divider";

import { colors, spacing, textSizes, fontWeights } from "../../theme";

import { Feather } from "@expo/vector-icons";

export default function Profile() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    Alert.alert("Logged Out", "You have been logged out.");
  }

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: spacing.xl,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: spacing.sm,
            color: colors.textMuted,
          }}
        >
          Loading profile...
        </Text>
      </View>
    );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.screenBG,
      }}
      contentContainerStyle={{
        padding: spacing.lg,
      }}
    >
      {/* -------------------------------------------------- */}
      {/* PROFILE HEADER */}
      {/* -------------------------------------------------- */}

      <Card
        elevated
        style={{
          padding: spacing.xl,
          marginBottom: spacing.xl,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Avatar */}
        <Avatar size="lg" name={profile?.name} />

        {/* Name + Contact */}
        <View style={{ flex: 1, marginLeft: spacing.lg }}>
          <Text
            style={{
              fontSize: textSizes.lg,
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
            }}
            numberOfLines={1}
          >
            {profile?.name || "Guest User"}
          </Text>

          {profile?.phone ? (
            <Text
              style={{
                fontSize: textSizes.sm,
                color: colors.textSecondary,
                marginTop: spacing.xs,
              }}
            >
              {profile.phone}
            </Text>
          ) : null}

          <Text
            style={{
              fontSize: textSizes.sm,
              color: colors.textSecondary,
              marginTop: spacing.xs,
            }}
          >
            {profile?.email}
          </Text>
        </View>

        {/* Edit Icon */}
        <Feather
          name="edit"
          size={22}
          color={colors.blue600}
          onPress={() => navigation.navigate("EditProfile")}
        />
      </Card>

      {/* -------------------------------------------------- */}
      {/* MENU (LIST) */}
      {/* -------------------------------------------------- */}

      <Card elevated style={{ paddingHorizontal: spacing.lg }}>
        <ListTile
          left={<Feather name="user" size={20} color={colors.textPrimary} />}
          title="Your Profile"
          showArrow
          onPress={() => navigation.navigate("EditProfile")}
        />

        <Divider />

        <ListTile
          left={
            <Feather name="shopping-bag" size={20} color={colors.textPrimary} />
          }
          title="Your Orders"
          showArrow
          onPress={() => navigation.navigate("Orders")}
        />

        <Divider />

        <ListTile
          left={<Feather name="heart" size={20} color={colors.textPrimary} />}
          title="Your Wishlist"
          showArrow
          onPress={() => navigation.navigate("Wishlist")}
        />

        <Divider />

        <ListTile
          left={<Feather name="map-pin" size={20} color={colors.textPrimary} />}
          title="Manage Address"
          showArrow
          onPress={() => navigation.navigate("ManageAddresses")}
        />

        <Divider />

        <ListTile
          left={<Feather name="share-2" size={20} color={colors.textPrimary} />}
          title="Share the App"
          showArrow
          onPress={() => {}}
        />

        <Divider />

        <ListTile
          left={<Feather name="info" size={20} color={colors.textPrimary} />}
          title="About Us"
          showArrow
          onPress={() => {}}
        />

        <Divider />

        <ListTile
          left={<Feather name="log-out" size={20} color={colors.red500} />}
          title="Logout"
          titleStyle={{ color: colors.red500 }}
          onPress={handleLogout}
        />
      </Card>

      {/* -------------------------------------------------- */}
      {/* VERSION FOOTER */}
      {/* -------------------------------------------------- */}

      <Text
        style={{
          textAlign: "center",
          color: colors.textMuted,
          fontSize: textSizes.sm,
          marginTop: spacing.xl,
          marginBottom: spacing.lg,
        }}
      >
        v1.0.0
      </Text>
    </ScrollView>
  );
}
