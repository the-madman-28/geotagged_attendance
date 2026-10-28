import React, { ReactNode } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  children?: ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  showLogo = true,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showLogo && (
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 46,
    height: 46,
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#102A56",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#718096",
  },
});