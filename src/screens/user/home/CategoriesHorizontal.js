import React from "react";
import {
  View,
  FlatList,
  Pressable,
  Image,
  Text,
  StyleSheet,
} from "react-native";
import SectionTitle from "../../../components/ui/SectionTitle";
import { colors, spacing, textSizes } from "../../../theme";
import DefaultCategories from "../../../../assets/default_categories.svg";

export default function CategoriesHorizontal({
  title = "Featured Categories",
  categories = [],
  onPressCategory,
}) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
      <SectionTitle title={title} />
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => {
          if (item.user_visibility === false) return null;
          const isValidImage =
            item.image_url &&
            typeof item.image_url === "string" &&
            item.image_url.startsWith("http");
          return (
            <Pressable
              onPress={() => onPressCategory && onPressCategory(item)}
              style={styles.featuredItem}
            >
              <View style={styles.featuredImageContainer}>
                {isValidImage ? (
                  <Image
                    source={{ uri: encodeURI(item.image_url) }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                ) : (
                  <DefaultCategories width={56} height={56} />
                )}
              </View>
              <Text style={styles.featuredName} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  featuredItem: {
    width: 110,
    marginRight: spacing.md,
    alignItems: "center",
  },
  featuredImageContainer: {
    backgroundColor: colors.white200,
    borderRadius: 12,
    width: 92,
    height: 92,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredName: {
    fontSize: textSizes.sm,
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
});
