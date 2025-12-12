import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import { showSuccess } from "../../utils/toastUtils";
import { IMAGES } from "../../const/imageConst";
import AddressEmpty from "../../../assets/address_empty.svg";

export default function ManageAddresses() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [addresses, setAddresses] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user && isFocused) loadAddresses();
  }, [user, isFocused]);

  async function loadAddresses() {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("id", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error) setAddresses(data || []);
  }

  async function setDefaultAddress(id) {
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    loadAddresses();
  }

  async function deleteAddress(id) {
    setDeleting(true);
    await supabase.from("addresses").delete().eq("id", id);
    setDeleting(false);
    setConfirmDeleteId(null);
    loadAddresses();
    showSuccess("Address deleted", "The address was removed successfully.");
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing.xl, flexGrow: 1 }}
      >
        {/* Empty state */}
        {addresses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <AddressEmpty width={220} height={220} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySub}>
              Add your first address to speed up checkout.
            </Text>
          </View>
        ) : (
          // Address list
          <View>
            {addresses.map((a) => (
              <Card key={a.id} style={{ marginBottom: spacing.md }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>{a.label}</Text>
                  {a.is_default ? (
                    <Text style={styles.defaultTag}>Default</Text>
                  ) : null}
                </View>

                <Text style={styles.addressText}>{a.address_line}</Text>
                <Text style={styles.subText}>📞 {a.phone}</Text>
                <Text style={styles.subText}>Pincode: {a.pincode}</Text>

                {/* Action buttons */}
                <View style={styles.buttonRow}>
                  {!a.is_default && (
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ flex: 1 }}
                      onPress={() => setDefaultAddress(a.id)}
                    >
                      Set Default
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() =>
                      navigation.navigate("EditAddress", {
                        id: a.id,
                        user: user,
                      })
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ flex: 1, borderColor: colors.danger }}
                    textStyle={{ color: colors.danger }}
                    onPress={() => setConfirmDeleteId(a.id)}
                  >
                    Delete
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footerInner}>
          <Button block onPress={() => navigation.navigate("AddAddress")}>
            + Add New Address
          </Button>
        </View>
      </SafeAreaView>

      {/* Delete confirmation modal */}
      {confirmDeleteId !== null && (
        <Modal
          visible
          title="Delete Address"
          onClose={() => setConfirmDeleteId(null)}
          showButtons={false}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: textSizes.md,
              marginBottom: spacing.md,
            }}
          >
            Are you sure you want to delete this address?
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              variant="secondary"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => setConfirmDeleteId(null)}
            >
              No
            </Button>
            <Button
              size="sm"
              style={{ flex: 1 }}
              onPress={() => deleteAddress(confirmDeleteId)}
              loading={deleting}
            >
              Yes
            </Button>
          </View>
        </Modal>
      )}
    </View>
  );
}

// 🎨 STYLES ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    textTransform: "capitalize",
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  defaultTag: {
    color: colors.success,
    fontSize: textSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  addressText: {
    marginTop: spacing.xs,
    fontSize: textSizes.md,
    color: colors.textPrimary,
  },
  subText: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: textSizes.sm,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: 10,
  },
  wrapper: { flex: 1, backgroundColor: colors.screenBG },
  footerSafeArea: {
    backgroundColor: colors.cardBG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBG,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: textSizes.lg,
    color: colors.textPrimary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptySub: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
