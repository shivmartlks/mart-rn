import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStoreSettings } from "../api/storeApi";
import { AppState } from "react-native";

const ActiveStoreContext = createContext(null);

const STORE_KEY = "ACTIVE_STORE_ID";

export function ActiveStoreProvider({ children }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const initialized = useRef(false);
  const storeRef = useRef(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const storeSettingsRef = useRef(null);

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
        // fetch store_settings for this store id
        try {
          const { data: ss } = await supabase
            .from("store_settings")
            .select("*")
            .eq("store_id", data.id)
            .maybeSingle();
          setStoreSettings(ss || null);
          storeSettingsRef.current = ss || null;
        } catch (err) {
          console.error(
            "ActiveStoreProvider: failed to load store_settings",
            err
          );
        }
        setLoading(false);
        initialized.current = true;
        storeRef.current = data;
        return;
      }
    }

    // 2. Fallback → use centralized fetchStoreSettings()
    try {
      const data = await fetchStoreSettings();
      if (data) {
        setStore(data);
        if (data.id) await AsyncStorage.setItem(STORE_KEY, data.id);
        // fetch store_settings for this store id
        try {
          const { data: ss } = await supabase
            .from("store_settings")
            .select("*")
            .eq("store_id", data.id)
            .maybeSingle();
          setStoreSettings(ss || null);
          storeSettingsRef.current = ss || null;
        } catch (err) {
          console.error(
            "ActiveStoreProvider: failed to load store_settings",
            err
          );
        }
      }
    } catch (err) {
      // Log but continue — leave store as null
      console.error("ActiveStoreProvider: failed to fetch store settings", err);
    }

    setLoading(false);
    // mark initialization complete
    initialized.current = true;
    storeRef.current = store;
  }

  async function setActiveStore(store) {
    setStore(store);
    await AsyncStorage.setItem(STORE_KEY, store.id);
    // refresh store_settings for the newly selected store
    try {
      const { data: ss } = await supabase
        .from("store_settings")
        .select("*")
        .eq("store_id", store.id)
        .maybeSingle();
      setStoreSettings(ss || null);
      storeSettingsRef.current = ss || null;
    } catch (err) {
      console.error(
        "ActiveStoreProvider: failed to load store_settings on setActiveStore",
        err
      );
    }
  }

  // keep a ref of latest store for the AppState handler
  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  // keep ref of latest storeSettings
  useEffect(() => {
    storeSettingsRef.current = storeSettings;
  }, [storeSettings]);

  // Refresh store when app comes to foreground
  useEffect(() => {
    function handleAppStateChange(nextAppState) {
      // If transitioning from background/inactive -> active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // only act after initial load
        if (!initialized.current) {
          appState.current = nextAppState;
          return;
        }

        const sid = storeRef.current?.id;
        if (!sid) {
          appState.current = nextAppState;
          return;
        }

        // fetch latest store row by id (do not block UI)
        (async () => {
          try {
            const { data } = await supabase
              .from("stores")
              .select("*")
              .eq("id", sid)
              .maybeSingle();
            if (data) setStore(data);
            // also refresh store_settings for this store id
            try {
              const { data: ss } = await supabase
                .from("store_settings")
                .select("*")
                .eq("store_id", sid)
                .maybeSingle();
              setStoreSettings(ss || null);
              storeSettingsRef.current = ss || null;
            } catch (err) {
              console.error(
                "ActiveStoreProvider: failed to refresh store_settings",
                err
              );
            }
          } catch (err) {
            console.error("ActiveStoreProvider: failed to refresh store", err);
          }
        })();
      }

      appState.current = nextAppState;
    }

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <ActiveStoreContext.Provider
      value={{
        store,
        storeId: store?.id,
        loading,
        storeSettings,
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
