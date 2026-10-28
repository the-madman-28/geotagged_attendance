import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function AppCard({
  children,
  style,
}: AppCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,

    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 20,

    elevation: 4,
  },
});