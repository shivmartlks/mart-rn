import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../services/supabase";

export async function signInWithGoogle() {
  try {
    const userInfo = await GoogleSignin.signIn();

    console.log("Full response:", userInfo);

    const idToken = userInfo.idToken;

    if (!idToken) {
      throw new Error("idToken missing from Google response");
    }

    const result = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    return result;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
}
