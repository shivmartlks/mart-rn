import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../services/supabase";

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    console.log("Full response:", userInfo);

    const idToken = userInfo.idToken;

    if (!idToken) {
      throw new Error("Google Sign-In failed: Missing idToken.");
    }

    const result = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    return result;
  } catch (error) {
    if (error.code === "CANCELED") {
      throw new Error("Google Sign-In was canceled by the user.");
    } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
      throw new Error("Google Play Services are not available on this device.");
    } else {
      console.error("Unexpected error during Google Sign-In:", error);
      throw new Error(
        "An unexpected error occurred during Google Sign-In. Please try again."
      );
    }
  }
}
