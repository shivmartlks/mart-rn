import { useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "../services/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { spacing, colors, textSizes } from "../theme";
import Logo from "../../assets/logo.svg";

async function handleGoogleSignIn() {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.idToken;

    if (!idToken) {
      throw new Error("idToken missing from Google response");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
}

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: colors.screenBG,
      }}
    >
      <Card
        elevated
        style={{
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xl,
          maxWidth: 420,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <Logo width={200} height={52} color="#111111" />
        </View>

        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: textSizes.sm,
              marginBottom: spacing.md,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        ) : null}

        <Button
          block
          size="md"
          onPress={async () => {
            try {
              setLoading(true);
              setError("");

              const data = await handleGoogleSignIn();
              console.log("Supabase login success:", data);
            } catch (err) {
              console.error("Login error:", err);
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          disabled={loading}
        >
          Continue with Google
        </Button>
      </Card>
    </View>
  );
}
