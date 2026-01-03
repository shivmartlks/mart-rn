import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Button from "../../components/ui/Button";
import { colors, spacing, textSizes, fontWeights } from "../../theme";
import CartEmptySvg from "../../../assets/orders_empty.svg";

export default function OrderSuccess() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId, address, timestamp } = route.params || {};

  const dt = timestamp ? new Date(timestamp) : new Date();
  const dateStr = dt.toLocaleDateString();
  const timeStr = dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      {/* Success icon */}
      <CartEmptySvg width={120} height={120} />

      {/* Title */}
      <Text style={styles.title}>Order Placed Successfully</Text>

      {/* Order ID */}
      {orderId ? (
        <Text style={styles.subtitle}>Order ID: {orderId}</Text>
      ) : null}

      {/* Date & Time */}
      <Text style={styles.subtitle}>Date: {dateStr}</Text>
      <Text style={styles.subtitle}>Time: {timeStr}</Text>

      {/* Address */}
      {address ? (
        <Text style={[styles.subtitle, { marginTop: spacing.xs }]}>
          Address: {address?.label || ""}
        </Text>
      ) : null}

      {/* ETA */}
      <Text style={[styles.eta]}>Estimated delivery: ~30 min</Text>

      {/* CTA */}
      <Button
        style={{ marginTop: spacing.lg }}
        onPress={() =>
          navigation.navigate("UserTabs", { screen: "Categories" })
        }
      >
        Browse Categories
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.screenBG,
    padding: spacing.lg,
  },
  title: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  eta: {
    fontSize: textSizes.md,
    color: colors.primary,
    marginTop: spacing.md,
  },
});
