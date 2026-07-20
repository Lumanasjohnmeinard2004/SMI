// app/member/_layout.tsx

 

import React from "react";

import { Stack } from "expo-router";

import {

  SafeAreaProvider,

  initialWindowMetrics,

} from "react-native-safe-area-context";

 

export default function MemberLayout() {

  return (

    <SafeAreaProvider initialMetrics={initialWindowMetrics}>

      <Stack

        screenOptions={{

          headerShown: false,

          animation: "none",

          animationDuration: 0,

          gestureEnabled: false,

          freezeOnBlur: true,

          contentStyle: {

            backgroundColor: "#003f24",

          },

        }}

      />

    </SafeAreaProvider>

  );

}