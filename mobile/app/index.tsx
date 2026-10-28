import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import { useAdminAuth } from "../src/context/AdminAuthContext";

const { width } = Dimensions.get("window");

export default function Index() {
  const {
    token: employeeToken,
    loading: employeeLoading,
  } = useAuth();

  const {
    token: adminToken,
    loading: adminLoading,
  } = useAdminAuth();

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const scale = useRef(
    new Animated.Value(0.75)
  ).current;

  const translateY = useRef(
    new Animated.Value(25)
  ).current;

  const [animationFinished, setAnimationFinished] =
    useState(false);

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 1.05,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setAnimationFinished(true);
        }
      });
    }, 2200);

    return () => {
      clearTimeout(timer);
      entranceAnimation.stop();
    };
  }, [opacity, scale, translateY]);

  /*
   * Keep the splash screen visible until:
   * 1. The splash animation has finished.
   * 2. Employee authentication has been restored.
   * 3. Admin authentication has been restored.
   */
  if (
    !animationFinished ||
    employeeLoading ||
    adminLoading
  ) {
    return (
      <View style={styles.splash}>
        {/* Decorative background */}
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        {/* Bottom waves */}
        <View style={styles.waveOne} />
        <View style={styles.waveTwo} />
        <View style={styles.waveThree} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [
                { scale },
                { translateY },
              ],
            },
          ]}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            Geotagged
          </Text>

          <Text style={styles.titleBlue}>
            Attendance
          </Text>

          <Text style={styles.tagline}>
            Be Present. Stay Connected.
          </Text>
        </Animated.View>
      </View>
    );
  }

  /*
   * Admin authentication takes priority.
   */
  if (adminToken) {
    return (
      <Redirect href="/admin/dashboard" />
    );
  }

  /*
   * Employee authentication.
   */
  if (employeeToken) {
    return (
      <Redirect href="/employee/dashboard" />
    );
  }

  /*
   * No authenticated session.
   */
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.85,
    zIndex: 10,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 18,
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#102A56",
    letterSpacing: -1.2,
  },

  titleBlue: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1688F7",
    letterSpacing: -1.2,
  },

  tagline: {
    marginTop: 12,
    fontSize: 15,
    color: "#52647D",
    fontWeight: "500",
  },

  circleTop: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#EAF5FF",
    top: -100,
    right: -90,
  },

  circleBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EFF9FF",
    bottom: 80,
    left: -100,
  },

  waveOne: {
    position: "absolute",
    width: width * 1.6,
    height: 190,
    borderRadius: 100,
    backgroundColor: "#DDF3FF",
    bottom: -100,
    left: -width * 0.3,
    transform: [{ rotate: "-7deg" }],
  },

  waveTwo: {
    position: "absolute",
    width: width * 1.6,
    height: 150,
    borderRadius: 100,
    backgroundColor: "#69C2FF",
    bottom: -115,
    left: -width * 0.35,
    transform: [{ rotate: "5deg" }],
  },

  waveThree: {
    position: "absolute",
    width: width * 1.7,
    height: 120,
    borderRadius: 100,
    backgroundColor: "#1688F7",
    bottom: -105,
    left: -width * 0.4,
    transform: [{ rotate: "-3deg" }],
  },
});