import { ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useActiveStore } from "../../contexts/ActiveStoreContext";
import Card from "../../components/ui/Card";
import { colors, spacing, textSizes } from "../../theme";

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBG,
  },
});
