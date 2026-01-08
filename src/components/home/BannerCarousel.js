import React from "react";
import { View, FlatList, Pressable, Image, Dimensions } from "react-native";
import { spacing } from "../../theme";

export default function BannerCarousel({ banners = [], onBannerPress, style }) {
  if (!Array.isArray(banners) || banners.length === 0) return null;
  const bannerWidth = Dimensions.get("window").width - spacing.md * 2;

  return (
    <View
      style={[
        { paddingHorizontal: spacing.md, marginBottom: spacing.md },
        style,
      ]}
    >
      <FlatList
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => {
          const img = item.image_url ? encodeURI(item.image_url) : "";
          return (
            <Pressable
              onPress={() => onBannerPress && onBannerPress(item)}
              style={{ marginRight: spacing.md }}
            >
              {img ? (
                <Image
                  source={{ uri: img }}
                  style={{ width: bannerWidth, height: 140, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    backgroundColor: "#EFEFEF",
                    borderRadius: 8,
                    width: bannerWidth,
                    height: 140,
                  }}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
