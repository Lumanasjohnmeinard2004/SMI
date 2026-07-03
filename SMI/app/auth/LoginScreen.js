// app/auth/LoginScreen.js

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import SmiLogo from "../../components/SmiLogo";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <View style={styles.topSection}>
        <View style={styles.bgCircleLeftOne} />
        <View style={styles.bgCircleLeftTwo} />
        <View style={styles.bgCircleLeftThree} />
        <View style={styles.bgCircleRightOne} />
        <View style={styles.bgCircleRightTwo} />
        <View style={styles.goldGlowLeft} />
        <View style={styles.goldGlowRight} />

        <TouchableOpacity style={styles.themeToggle}>
          <Ionicons name="sunny-outline" size={15} color="#7c5a00" />
          <View style={styles.toggleKnob} />
        </TouchableOpacity>

        <View style={styles.logoShadow}>
          <SmiLogo size={138} />
        </View>

        <Text style={styles.appName}>SMI Coop</Text>

        <Text style={styles.subtitle}>
          Savings Mutual Inter-Company{"\n"}
          Multipurpose Cooperative
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgeItem}>
            <Ionicons name="shield-checkmark" size={16} color="#fff3c4" />
            <Text style={styles.badgeText}>Secure</Text>
          </View>

          <View style={styles.badgeItem}>
            <Ionicons name="checkmark-circle" size={16} color="#fff3c4" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>

          <View style={styles.badgeItem}>
            <Ionicons name="lock-closed" size={16} color="#fff3c4" />
            <Text style={styles.badgeText}>CDA Licensed</Text>
          </View>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Member Sign In</Text>
        <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputBox}>
          <Feather name="user" size={22} color="#b07a00" />

          <TextInput
            style={styles.input}
            placeholder="e.g. msantos"
            placeholderTextColor="#79808e"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputBox}>
          <Feather name="lock" size={22} color="#b07a00" />

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#79808e"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#b07a00"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/member/HomeScreen")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push("/admin/AdminDashboardScreen")}
        >
          <Text style={styles.adminButtonText}>Login as Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003f23",
  },

  topSection: {
    height: "50%",
    backgroundColor: "#004b2b",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingTop: 38,
  },

  bgCircleLeftOne: {
    position: "absolute",
    left: -210,
    top: 140,
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    borderColor: "rgba(197, 145, 25, 0.38)",
  },

  bgCircleLeftTwo: {
    position: "absolute",
    left: -240,
    top: 165,
    width: 430,
    height: 430,
    borderRadius: 215,
    borderWidth: 1,
    borderColor: "rgba(197, 145, 25, 0.24)",
  },

  bgCircleLeftThree: {
    position: "absolute",
    left: -265,
    top: 190,
    width: 480,
    height: 480,
    borderRadius: 240,
    borderWidth: 1,
    borderColor: "rgba(197, 145, 25, 0.16)",
  },

  bgCircleRightOne: {
    position: "absolute",
    right: -215,
    top: 155,
    width: 390,
    height: 390,
    borderRadius: 195,
    borderWidth: 1,
    borderColor: "rgba(197, 145, 25, 0.34)",
  },

  bgCircleRightTwo: {
    position: "absolute",
    right: -250,
    top: 185,
    width: 450,
    height: 450,
    borderRadius: 225,
    borderWidth: 1,
    borderColor: "rgba(197, 145, 25, 0.22)",
  },

  goldGlowLeft: {
    position: "absolute",
    left: -18,
    top: 190,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(225, 173, 47, 0.10)",
  },

  goldGlowRight: {
    position: "absolute",
    right: -20,
    top: 205,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(225, 173, 47, 0.10)",
  },

  themeToggle: {
    position: "absolute",
    right: 21,
    top: 28,
    width: 66,
    height: 34,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d5a62c",
    backgroundColor: "#fff8dc",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },

  toggleKnob: {
    position: "absolute",
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },

  logoShadow: {
    marginTop: 44,
    borderRadius: 80,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  appName: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 26,
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  subtitle: {
    color: "#ffffff",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 10,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 26,
    paddingHorizontal: 18,
  },

  badgeItem: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(198, 145, 25, 0.65)",
    backgroundColor: "rgba(0, 71, 41, 0.72)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginHorizontal: 5,
  },

  badgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
  },

  formCard: {
    flex: 1,
    backgroundColor: "#fbfcfb",
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    paddingHorizontal: 30,
    paddingTop: 45,
  },

  formTitle: {
    color: "#06361f",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  formSubtitle: {
    color: "#727b88",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
  },

  label: {
    color: "#06361f",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },

  inputBox: {
    height: 60,
    borderWidth: 1,
    borderColor: "#c18a13",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  input: {
    flex: 1,
    fontSize: 17,
    color: "#123d2b",
    marginLeft: 15,
  },

  signInButton: {
    height: 58,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#c18a13",
    backgroundColor: "#005b35",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  signInText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
  },

  adminButton: {
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#c18a13",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  adminButtonText: {
    color: "#06472f",
    fontSize: 18,
    fontWeight: "900",
  },
});