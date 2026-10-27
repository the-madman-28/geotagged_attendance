import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />

      <View style={styles.container}>
        <Text style={styles.title}>
          Page Not Found
        </Text>

        <Link href="/login" style={styles.link}>
          Go to Login
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  link: {
    fontSize: 16,
    color: "#2563eb",
  },
});