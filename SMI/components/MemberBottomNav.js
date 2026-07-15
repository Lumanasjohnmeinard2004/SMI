// components/MemberBottomNav.js

 

import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

 

const items = [

  ["Home", "/member/HomeScreen", "home", null],

  ["Savings", "/member/SavingsScreen", null, "piggy-bank-outline"],

  ["Loans", "/member/LoansScreen", "credit-card", null],

  ["Dividend", "/member/DividendsScreen", "trending-up", null],

  ["Requests", "/member/RequestsScreen", "clipboard", null],

  ["Profile", "/member/ProfileScreen", "user", null],

];

 

export default function MemberBottomNav({ activeTab }) {

  const router = useRouter();

  const params = useLocalSearchParams();

 

  return (

    <View style={styles.bottomNav}>

      {items.map(([label, route, icon, materialIcon]) => {

        const active = String(activeTab || "").toLowerCase() === label.toLowerCase();

        return (

          <TouchableOpacity

            key={label}

            style={[styles.navItem, active && styles.navItemActive]}

            activeOpacity={0.82}

            onPress={() => router.replace({ pathname: route, params })}

          >

            {materialIcon ? (

              <MaterialCommunityIcons name={materialIcon} size={22} color={active ? "#c99b27" : "#e7f2eb"} />

            ) : (

              <Feather name={icon} size={22} color={active ? "#c99b27" : "#e7f2eb"} />

            )}

            <Text style={active ? styles.navTextActive : styles.navText}>{label}</Text>

            {active && <View style={styles.activeLine} />}

          </TouchableOpacity>

        );

      })}

    </View>

  );

}

 

const styles = StyleSheet.create({

  bottomNav: {

    position: "absolute", left: 12, right: 12, bottom: 10, height: 82,

    borderRadius: 28, backgroundColor: "#003f24", borderWidth: 1.2,

    borderColor: "#c99b27", flexDirection: "row", alignItems: "center",

    justifyContent: "space-around", paddingHorizontal: 4, zIndex: 20,

  },

  navItem: { flex: 1, height: 68, alignItems: "center", justifyContent: "center", position: "relative", borderRadius: 20 },

  navItemActive: { backgroundColor: "rgba(255,255,255,0.04)" },

  navText: { color: "#e7f2eb", fontSize: 9, fontWeight: "700", marginTop: 5 },

  navTextActive: { color: "#c99b27", fontSize: 9, fontWeight: "900", marginTop: 5 },

  activeLine: { position: "absolute", bottom: 3, width: 28, height: 3, borderRadius: 3, backgroundColor: "#c99b27" },

});

