// app/member/_layout.js

import { Stack } from "expo-router";

export default function MemberLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        animationDuration: 0,
        gestureEnabled: false,
      }}
    />
  );
}