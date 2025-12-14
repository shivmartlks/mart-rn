import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { colors, spacing } from "../../theme";

export default function CategoryView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setLoading(false);
    if (error) {
      Alert.alert("Error", "Failed to load category");
      return;
    }
    if (data) {
      setName(data.name || "");
      setVisible(!!data.user_visibility);
    }
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBG }}>
      <View style={{ padding: spacing.lg }}>
        <Card>
          <Input
            placeholder="Category Name"
            value={name}
            editable={false}
            size="md"
            style={{ marginBottom: spacing.md }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{ marginRight: spacing.sm, color: colors.textSecondary }}
            >
              Visible to users
            </Text>
            <Switch value={visible} onValueChange={() => {}} disabled />
          </View>

          <Button
            block
            style={{ marginTop: spacing.lg }}
            onPress={() => navigation.goBack()}
          >
            Close
          </Button>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
  },
});
