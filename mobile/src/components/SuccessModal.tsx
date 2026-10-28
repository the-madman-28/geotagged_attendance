import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  details?: string[];
  buttonText?: string;
  onClose: () => void;
}

export default function SuccessModal({
  visible,
  title,
  message,
  details = [],
  buttonText = "Continue",
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          {details.length > 0 && (
            <View style={styles.details}>
              {details.map((detail, index) => (
                <View key={`${detail}-${index}`} style={styles.detailRow}>
                  <View style={styles.detailDot} />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  checkmark: {
    fontSize: 40,
    fontWeight: "800",
    color: "#16A34A",
    lineHeight: 46,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },

  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },

  details: {
    width: "100%",
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    gap: 10,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 10,
  },

  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },

  button: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});