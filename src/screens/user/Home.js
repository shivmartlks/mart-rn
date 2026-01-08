import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes } from "../../theme";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const navigation = useNavigation();
  const { homeAlert } = useActiveStore();

  return (
    <ScrollView style={styles.container}>
      {homeAlert ? (
        <Card
          variant={homeAlert.variant}
          style={{ margin: spacing.md, marginBottom: spacing.md }}
        >
          <Text
            style={{
              color:
                homeAlert.type === "closed"
                  ? colors.warning
                  : colors.textPrimary,
              fontSize: textSizes.md,
            }}
          >
            {homeAlert.message}
          </Text>
        </Card>
      ) : null}

      {/* SEARCH CARD - placed below alert (if any) and above other sections */}
      <Pressable
        onPress={() => navigation.navigate("Search")}
        style={{ paddingHorizontal: spacing.md }}
        accessibilityRole="button"
      >
        <Card style={styles.searchCard}>
          <View style={styles.searchInner}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <Text style={styles.searchText}>Search for products, brands…</Text>
          </View>
        </Card>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
  },
  searchCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBG,
    borderColor: colors.border,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: textSizes.md,
  },
});
