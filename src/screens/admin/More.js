import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import { getProfile } from "../../services/profileService";

import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import ListTile from "../../components/ui/ListTile";
import Divider from "../../components/ui/Divider";
import BottomSheet from "../../components/ui/BottomSheet";
import Button from "../../components/ui/Button";

import { colors, spacing, textSizes, fontWeights } from "../../theme";

import { Feather } from "@expo/vector-icons";

export default function More() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
  }

  async function handleConfirmLogout() {
    await supabase.auth.signOut();
    setLogoutOpen(false);
  }

  function handleLogout() {
    setLogoutOpen(true);
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
      </Card>

      {/* -------------------------------------------------- */}
      {/* MENU (LIST) */}
      {/* -------------------------------------------------- */}

      <Card elevated style={{ paddingHorizontal: spacing.lg }}>
        <ListTile
          left={<Feather name="user" size={20} color={colors.textPrimary} />}
          title="Manage App"
          showArrow
        />

        <Divider />

        <ListTile
          left={<Feather name="map-pin" size={20} color={colors.textPrimary} />}
          title="Manage Store"
          showArrow
        />

        <Divider />

        <ListTile
          left={<Feather name="map-pin" size={20} color={colors.textPrimary} />}
          title="Manage Users"
          showArrow
        />

        <Divider />

        <ListTile
          left={<Feather name="log-out" size={20} color={colors.red500} />}
          title="Logout"
          titleStyle={{ color: colors.red500 }}
          onPress={handleLogout}
        />
      </Card>

      {/* Logout Confirmation Bottom Sheet */}
      <BottomSheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Logout"
      >
        <Text style={{ color: colors.textSecondary }}>
          Are you sure you want to logout?
        </Text>

        <Button
          block
          variant="secondary"
          style={{ marginTop: spacing.sm }}
          onPress={() => setLogoutOpen(false)}
        >
          No, Stay Logged In
        </Button>

        <Button
          block
          style={{ marginTop: spacing.lg }}
          onPress={handleConfirmLogout}
        >
          Yes, Logout
        </Button>
      </BottomSheet>

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
