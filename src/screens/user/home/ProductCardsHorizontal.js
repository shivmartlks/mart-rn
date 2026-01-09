import React, { memo } from "react";
import { View, FlatList } from "react-native";
import SectionTitle from "../../../components/ui/SectionTitle";
import { spacing } from "../../../theme";
import ProductCard from "../common/productCard";

function ProductCardsHorizontal({
  title,
  products = [],
  onPressItem,
  cartItems = {},
  onIncrease,
  onDecrease,
  showQuantityControls = false,
  showStockOverlays = false,
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
        extraData={{ cartItems, showQuantityControls, showStockOverlays }}
        renderItem={({ item }) => {
          const qty = cartItems?.[item.id] || 0;
          const isOutOfStock = (item._stock_value ?? 0) <= 0;
          return (
            <ProductCard
              product={item}
              qty={qty}
              onPress={() => onPressItem && onPressItem(item)}
              onIncrease={() => onIncrease && onIncrease(item)}
              onDecrease={() => onDecrease && onDecrease(item)}
              showQuantityControls={showQuantityControls && !isOutOfStock}
              showStockOverlays={showStockOverlays}
              style={{
                width: 160,
                maxWidth: 160,
                flexBasis: "auto",
                marginRight: spacing.md,
              }}
            />
          );
        }}
      />
    </View>
  );
}

export default memo(ProductCardsHorizontal);
