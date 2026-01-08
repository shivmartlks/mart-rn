import React from "react";
import { Pressable, View, Text } from "react-native";
import Card from "../ui/Card";
import { colors, spacing, textSizes } from "../../theme";
import { Feather } from "@expo/vector-icons";

export default function SearchCard({ onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: spacing.md }}
      accessibilityRole="button"
    >
      <Card
        style={[
          {
            marginBottom: spacing.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.cardBG,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="search" size={18} color={colors.textSecondary} />
          <Text
            style={{
              marginLeft: spacing.sm,
              color: colors.textSecondary,
              fontSize: textSizes.md,
            }}
          >
            Search for products, brands…
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
