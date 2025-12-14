// src/components/ui/BottomSheet.js

import React from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
} from "react-native";
import { colors, spacing, radii, componentTokens, shadows } from "../../theme";

export default function BottomSheet({
  visible,
  onClose,
  children,
  title = "",
  showHeader = true,
  style = {},
  footer = null,
}) {
  const screenHeight = Dimensions.get("window").height;
  const MAX_SHEET_HEIGHT = Math.round(screenHeight * 0.8);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dim background */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Sheet Container */}
      <View
        style={[styles.sheetContainer, { maxHeight: MAX_SHEET_HEIGHT }, style]}
      >
        {/* Drag Handle */}
        <View style={styles.handle} />

        {/* Header (optional) */}
        {showHeader && title ? <Text style={styles.title}>{title}</Text> : null}

        {/* Content (scrollable) */}
        <ScrollView
          style={{ width: "100%", marginTop: spacing.md }}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>

        {/* Footer (optional) */}
        {footer ? (
          <View style={{ width: "100%", paddingTop: spacing.sm }}>
            {footer}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  sheetContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: componentTokens.sheet.bg,
    padding: componentTokens.sheet.padding,
    borderTopLeftRadius: componentTokens.sheet.radiusTop,
    borderTopRightRadius: componentTokens.sheet.radiusTop,
    ...shadows.card,
  },

  handle: {
    width: 42,
    height: 5,
    backgroundColor: colors.gray200,
    borderRadius: radii.sm,
    alignSelf: "center",
    marginBottom: spacing.md,
  },

  title: {
    fontSize: spacing.xl, // 20px
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
});

// const [open, setOpen] = useState(false);

// <BottomSheet
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Payment Successful"
// >
//   <Text style={{ fontSize: 16, color: colors.textSecondary }}>
//     Your payment has been completed!
//   </Text>

//   <Button
//     block
//     style={{ marginTop: spacing.lg }}
//     onPress={() => setOpen(false)}
//   >
//     Done
//   </Button>

//   <Button
//     block
//     variant="secondary"
//     style={{ marginTop: spacing.sm }}
//     onPress={() => {}}
//   >
//     View Transaction
//   </Button>
// </BottomSheet>
