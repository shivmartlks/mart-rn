import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (newSession?.user) loadUserRole(newSession.user);
        else {
          setSession(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function initSession() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (session?.user) {
      await loadUserRole(session.user);
    } else {
      setLoading(false);
    }
  }

  async function loadUserRole(user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setSession(user);
    setRole(profile?.role || null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ session, user: session, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
