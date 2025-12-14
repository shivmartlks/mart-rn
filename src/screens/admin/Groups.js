import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import { fetchGroups, fetchSubCategories } from "../../services/adminApi";
import Button from "../../components/ui/Button";
import BottomSheet from "../../components/ui/BottomSheet";
import { colors, spacing, textSizes } from "../../theme";
import { useNavigation } from "@react-navigation/native";

export default function Groups() {
  const navigation = useNavigation();
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    await loadSubcategories();
    await loadGroups();
    setLoading(false);
  }

  async function loadSubcategories() {
    const { data, error } = await fetchSubCategories();
    if (error) Alert.alert("Error", "Failed to fetch subcategories");
    else setSubcategories(data || []);
  }

  async function loadGroups() {
    const { data, error } = await fetchGroups();
    if (error) Alert.alert("Error", "Failed to fetch groups");
    else setGroups(data || []);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("product_groups")
      .delete()
      .eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) Alert.alert("Error", "Failed to delete group");
    else loadGroups();
  }

  // -----------------------------
  // UI
  // -----------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#777" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        {/* Table-like list synced with Categories/SubCategories */}
        <View style={styles.card}>
          {/* Header row */}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, color: colors.textSecondary }}>
              Group Name
            </Text>
            <Text
              style={{
                width: 220,
                textAlign: "right",
                color: colors.textSecondary,
              }}
            >
              Actions
            </Text>
          </View>

          {groups.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
              <Text
                style={{ color: colors.textSecondary, fontSize: textSizes.sm }}
              >
                No groups added yet.
              </Text>
            </View>
          ) : (
            groups.map((g) => {
              const sub = subcategories.find((s) => s.id === g.subcategory_id);
              return (
                <View
                  key={g.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderColor: colors.divider,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: textSizes.sm,
                      }}
                    >
                      {g.name}
                      <Text style={{ color: colors.textSecondary }}>
                        {" "}
                        ({sub?.name || "Unassigned"})
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      columnGap: spacing.xs,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        navigation.navigate("AdminForm", {
                          type: "group",
                          mode: "view",
                          id: g.id,
                        })
                      }
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onPress={() =>
                        navigation.navigate("AdminForm", {
                          type: "group",
                          mode: "edit",
                          id: g.id,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      textStyle={{ color: colors.danger }}
                      style={{ borderColor: colors.danger }}
                      onPress={() => setDeleteId(g.id)}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sticky Add Group CTA -> open AdminForm */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: colors.cardBG,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: 8,
          }}
        >
          <Button
            block
            onPress={() =>
              navigation.navigate("AdminForm", { type: "group", mode: "edit" })
            }
          >
            Add Group
          </Button>
        </View>
      </SafeAreaView>

      {/* Delete confirmation bottom sheet */}
      {deleteId !== null && (
        <BottomSheet
          visible
          title="Delete Group"
          onClose={() => setDeleteId(null)}
        >
          <Text style={{ color: colors.textSecondary }}>
            Are you sure you want to delete this group?
          </Text>
          <Button
            block
            style={{ marginTop: spacing.lg }}
            onPress={confirmDelete}
            loading={deleting}
          >
            Yes, Delete
          </Button>
          <Button
            block
            variant="secondary"
            style={{ marginTop: spacing.sm }}
            onPress={() => setDeleteId(null)}
          >
            No, Cancel
          </Button>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: colors.cardBG,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
});
