import { useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "../services/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { spacing, colors, textSizes } from "../theme";
import Logo from "../../assets/logo.svg";

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

              await GoogleSignin.hasPlayServices();

              const userInfo = await GoogleSignin.signIn();

              console.log("Google response:", userInfo);

              const idToken = userInfo?.data?.idToken;

              if (!idToken) {
                throw new Error("idToken missing from Google response");
              }

              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: idToken,
              });

              if (error) throw error;

              console.log("Supabase login success:", data);
            } catch (err) {
              console.log("Login error:", err);
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
