import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

interface AppBackgroundProps {
  children: ReactNode;
}

export default function AppBackground({
  children,
}: AppBackgroundProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />

      <View style={styles.waveOne} />
      <View style={styles.waveTwo} />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    overflow: "hidden",
  },

  content: {
    flex: 1,
    zIndex: 5,
  },

  circleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EAF6FF",
    top: -90,
    right: -60,
  },

  circleTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#EEF9FF",
    bottom: -50,
    left: -70,
  },

  waveOne: {
    position: "absolute",
    width: 500,
    height: 110,
    borderRadius: 100,
    backgroundColor: "#E3F5FF",
    bottom: -65,
    left: -100,
    transform: [{ rotate: "-6deg" }],
  },

  waveTwo: {
    position: "absolute",
    width: 500,
    height: 80,
    borderRadius: 100,
    backgroundColor: "#D1EDFF",
    bottom: -50,
    right: -180,
    transform: [{ rotate: "6deg" }],
  },
});