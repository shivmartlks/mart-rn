import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
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

  // Compute store open/closed status from store.open_time and store.close_time
  const { isStoreOpen, closedMessage } = useMemo(() => {
    const ot = store?.open_time ?? null;
    const ct = store?.close_time ?? null;

    // If either missing, treat as always open
    if (!ot || !ct) return { isStoreOpen: true, closedMessage: null };

    // Flexible parser: accepts 'HH:MM' (24h) or 'h', 'h AM/PM', 'h:mm AM/PM'
    const parse = (t) => {
      if (typeof t !== "string") return null;
      const s = t.trim();

      // 1) Try 24-hour HH:MM or HH:MM:SS (accept seconds but ignore them)
      const hhmm = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
      if (hhmm) {
        const h = parseInt(hhmm[1], 10);
        const m = parseInt(hhmm[2], 10);
        // seconds present in hhmm[3] are ignored for scheduling purposes
        if (h >= 0 && h < 24 && m >= 0 && m < 60) return { h, m };
        return null;
      }

      // 2) Try 12-hour with optional minutes/seconds and AM/PM (e.g. '11', '11 AM', '11:30 PM', '11:30:00 PM')
      const ampm = s.match(
        /^(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?\s*(AM|PM|am|pm)?$/
      );
      if (ampm) {
        let h = parseInt(ampm[1], 10);
        const m = ampm[2] ? parseInt(ampm[2], 10) : 0;
        const period = ampm[4] ? ampm[4].toUpperCase() : null;
        if (period) {
          if (h === 12) h = period === "AM" ? 0 : 12;
          else if (period === "PM") h = h + 12;
        }
        if (h >= 0 && h < 24 && m >= 0 && m < 60) return { h, m };
      }

      return null;
    };

    const o = parse(ot);
    const c = parse(ct);
    if (!o || !c) return { isStoreOpen: true, closedMessage: null };

    const now = new Date();
    const openDt = new Date(now);
    openDt.setHours(o.h, o.m, 0, 0);
    const closeDt = new Date(now);
    closeDt.setHours(c.h, c.m, 0, 0);

    const fmt = ({ h, m }) => {
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const min = String(m).padStart(2, "0");
      return `${hour12}:${min} ${period}`;
    };

    if (now < openDt) {
      return {
        isStoreOpen: false,
        closedMessage: `Please come back at ${fmt(o)}`,
      };
    }

    if (now >= closeDt) {
      return {
        isStoreOpen: false,
        closedMessage: `We’ll be back tomorrow at ${fmt(o)}`,
      };
    }

    return { isStoreOpen: true, closedMessage: null };
  }, [store]);

  // Derived shared status: surge / ordering disabled / closed
  const { homeAlert, includeSurge, surgeCharge, surgeMessage, surgeMode } =
    useMemo(() => {
      const ss = storeSettings || {};
      const smode = !!ss.surge_mode;
      const scharge = (() => {
        const v = Number(ss.surge_charge ?? 0);
        return Number.isFinite(v) ? v : 0;
      })();
      const smessage = (ss.surge_message || "").trim();

      const incSurge =
        smode &&
        scharge > 0 &&
        ss?.is_ordering_enabled !== false &&
        isStoreOpen;

      let alert = null;
      if (!isStoreOpen) {
        alert = {
          type: "closed",
          variant: "warning",
          message: closedMessage || "Store is currently closed",
        };
      } else if (ss?.is_ordering_enabled === false) {
        alert = {
          type: "ordering_disabled",
          variant: "danger",
          message: "Ordering is currently disabled. Please try again later.",
        };
      } else if (
        smode &&
        scharge > 0 &&
        isStoreOpen &&
        ss?.is_ordering_enabled !== false
      ) {
        alert = {
          type: "surge",
          variant: "warning",
          message: smessage || `Surge Charges: ₹${scharge}`,
        };
      }

      return {
        homeAlert: alert,
        includeSurge: incSurge,
        surgeCharge: scharge,
        surgeMessage: smessage,
        surgeMode: smode,
      };
    }, [storeSettings, isStoreOpen, closedMessage]);

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
        // set store (structural info only)
        setStore(data);
        // fetch store_settings for this store id and keep it separate
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
        // fetch store_settings for this store id and keep it separate
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
        homeAlert,
        includeSurge,
        surgeCharge,
        surgeMessage,
        surgeMode,
        isStoreOpen,
        closedMessage,
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
