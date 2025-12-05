import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleRedirect() {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });
      if (!error) {
        navigate("/");
      }
    }
    handleRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div
        className="
          bg-white border border-border 
          shadow-card rounded-2xl 
          px-6 py-8 text-center
        "
      >
        <p className="text-text-primary text-lg font-medium">
          Confirming your email...
        </p>
        <p className="text-text-muted text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
