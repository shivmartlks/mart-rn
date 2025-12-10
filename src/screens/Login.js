import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { supabase } from "../services/supabase";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { spacing, colors, textSizes, fontWeights } from "../theme";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) setError(authError.message);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: colors.background,
      }}
    >
      {/* Centered Card */}
      <Card
        elevated
        style={{
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xl,
          maxWidth: 420, // ⭐ visually tighter layout
          alignSelf: "center", // ⭐ centers card on big screens
          width: "100%",
        }}
      >
        <Text
          style={{
            fontSize: textSizes.xl,
            fontWeight: fontWeights.semibold,
            textAlign: "center",
            marginBottom: spacing.lg,
            color: colors.text,
          }}
        >
          Login to ShivMart
        </Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          size="md"
          style={{ marginBottom: spacing.md }}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          size="md"
          style={{ marginBottom: spacing.sm }}
        />

        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: textSizes.sm,
              marginBottom: spacing.md,
            }}
          >
            {error}
          </Text>
        ) : null}

        <Button
          block
          size="md"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={{ marginTop: spacing.sm }}
        >
          Login
        </Button>

        <TouchableOpacity
          style={{ marginTop: spacing.md }}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text
            style={{
              textAlign: "center",
              color: colors.primary,
              fontSize: textSizes.sm,
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Signup */}
      <View
        style={{
          marginTop: spacing.lg,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: textSizes.sm }}>
          Don’t have an account?
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text
            style={{
              marginLeft: spacing.xs,
              color: colors.primary,
              fontSize: textSizes.sm,
              fontWeight: fontWeights.medium,
            }}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
