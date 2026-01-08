import React from "react";
import { View, FlatList } from "react-native";
import ImageCard from "../../../components/ui/ImageCard";
import SectionTitle from "../../../components/ui/SectionTitle";
import { spacing } from "../../../theme";

export default function ProductCardsHorizontal({
  title,
  products = [],
  onPressItem,
}) {
  if (!Array.isArray(products) || products.length === 0) return null;
  return (
    <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
      {title ? <SectionTitle title={title} /> : null}
      <FlatList
        data={products}
        horizontal
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => {
          const img =
            item.image_url &&
            typeof item.image_url === "string" &&
            item.image_url.startsWith("http")
              ? encodeURI(item.image_url)
              : "";
          return (
            <View style={{ width: 160, marginRight: spacing.md }}>
              <ImageCard
                title={item.name}
                price={item.price}
                image={img}
                onPress={() => onPressItem && onPressItem(item)}
                style={{ width: 160 }}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
