import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ActiveStoreContext = createContext(null);

const STORE_KEY = "ACTIVE_STORE_ID";

export function ActiveStoreProvider({ children }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStore();
  }, []);

  async function initStore() {
    setLoading(true);

    // 1. Check local storage
    const savedStoreId = await AsyncStorage.getItem(STORE_KEY);

    if (savedStoreId) {
      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("id", savedStoreId)
        .maybeSingle();

      if (data) {
        setStore(data);
        setLoading(false);
        return;
      }
    }

    // 2. Fallback → first active store
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setStore(data);
      await AsyncStorage.setItem(STORE_KEY, data.id);
    }

    setLoading(false);
  }

  async function setActiveStore(store) {
    setStore(store);
    await AsyncStorage.setItem(STORE_KEY, store.id);
  }

  return (
    <ActiveStoreContext.Provider
      value={{
        store,
        storeId: store?.id,
        loading,
        setActiveStore,
      }}
    >
      {children}
    </ActiveStoreContext.Provider>
  );
}

export function useActiveStore() {
  const ctx = useContext(ActiveStoreContext);
  if (!ctx) {
    throw new Error("useActiveStore must be used inside ActiveStoreProvider");
  }
  return ctx;
}
