import { Stack } from "expo-router";

export default function EmployeeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#F8FBFF",
        },
      }}
    />
  );
}