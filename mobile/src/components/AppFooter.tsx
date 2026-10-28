import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AppFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        © 2026 Made by Madman
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },

  text: {
    fontSize: 11,
    color: "#7B8CA3",
    fontWeight: "500",
  },
});