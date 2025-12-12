// src/components/ui/Modal.js

import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { colors, radii, spacing, textSizes, shadows } from "../../theme";
import Button from "./Button";

export default function Modal({
  visible,
  title = "",
  message = "",
  primaryText = "",
  secondaryText = "",
  onPrimary = null,
  onSecondary = null,
  onClose = null,
  children,
  showButtons = true,
  style = {},
}) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Centered Modal */}
      <View style={styles.centerWrap}>
        <View style={[styles.modalContainer, style]}>
          {/* Title */}
          {title ? <Text style={styles.title}>{title}</Text> : null}

          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Custom content */}
          {children}

          {/* Buttons */}
          {showButtons && (
            <View style={styles.buttonGroup}>
              {secondaryText ? (
                <Button
                  block
                  variant="secondary"
                  style={{ marginBottom: spacing.sm }}
                  onPress={onSecondary}
                >
                  {secondaryText}
                </Button>
              ) : null}

              {primaryText ? (
                <Button block onPress={onPrimary}>
                  {primaryText}
                </Button>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  centerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "82%",
    backgroundColor: colors.cardBG,
    padding: spacing.xl,
    borderRadius: radii.lg + 4, // ~20
    ...shadows.card,
  },

  title: {
    fontSize: textSizes.xl,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.md,
  },

  message: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  buttonGroup: {
    marginTop: spacing.md,
  },
});

// const [open, setOpen] = useState(false);

// <Modal
//   visible={open}
//   title="Are you sure?"
//   message="Do you want to delete this address?"
//   primaryText="Delete"
//   secondaryText="Cancel"
//   onPrimary={() => console.log("delete")}
//   onSecondary={() => setOpen(false)}
//   onClose={() => setOpen(false)}
// />
