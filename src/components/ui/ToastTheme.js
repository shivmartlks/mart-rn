// src/theme/ToastTheme.js

import { StyleSheet, View, Text } from "react-native";
import { colors, radii, spacing, textSizes } from "../../theme";

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.base, styles.success]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View style={[styles.base, styles.error]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View style={[styles.base, styles.info]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  base: {
    width: "90%",
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignSelf: "center",
  },
  title: {
    fontSize: textSizes.md,
    fontWeight: "600",
    color: colors.white50,
  },
  subtitle: {
    fontSize: textSizes.sm,
    color: colors.white50,
    marginTop: 4,
  },

  // Variants
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.danger,
  },
  info: {
    backgroundColor: colors.gray800,
  },
});
