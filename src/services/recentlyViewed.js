import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECENTLY_VIEWED_MAX } from "../const/listConfig";

const STORAGE_KEY = "recently_viewed_products_v1";
const MAX_ITEMS = RECENTLY_VIEWED_MAX;

async function getRecentlyViewedIds() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (err) {
    // fail silently
    return [];
  }
}

async function addRecentlyViewed(id) {
  if (id === undefined || id === null) return;
  const sid = typeof id === "string" ? id : String(id);
  try {
    const current = await getRecentlyViewedIds();
    // remove duplicates
    const filtered = current.filter((x) => String(x) !== sid);
    // add to front
    filtered.unshift(sid);
    // trim
    const trimmed = filtered.slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    // ignore errors
  }
}

async function clearRecentlyViewed() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

export { getRecentlyViewedIds, addRecentlyViewed, clearRecentlyViewed };
