Testing// app/auth/LoginScreen.js

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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07956b" />

      <View style={styles.topSection}>
        <View style={styles.statusBar}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.batteryWrap}>
            <View style={styles.battery} />
            <View style={styles.batterySmall} />
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle}>
          <Ionicons name="sunny-outline" size={15} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.logoOuterCircle}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="bank-outline" size={48} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.appName}>CoopConnect</Text>
        <Text style={styles.subtitle}>
          Savings Mutual Intercompany Multipurpose Co-op
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgeItem}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#d9fff0" />
            <Text style={styles.badgeText}>Secure</Text>
          </View>

          <View style={styles.badgeItem}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#d9fff0" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>

          <View style={styles.badgeItem}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#d9fff0" />
            <Text style={styles.badgeText}>CDA Licensed</Text>
          </View>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Member Sign In</Text>
        <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. msantos"
          placeholderTextColor="#8aa99c"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordBox}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#8aa99c"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#9aa8a1"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.bottomLine} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#006b4b",
  },

  topSection: {
    height: "47%",
    backgroundColor: "#07956b",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    alignItems: "center",
    paddingTop: 8,
    position: "relative",
  },

  statusBar: {
    width: "100%",
    height: 28,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  batteryWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  battery: {
    width: 18,
    height: 9,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },

  batterySmall: {
    width: 3,
    height: 7,
    backgroundColor: "#ffffff",
    borderRadius: 1,
    marginLeft: 2,
  },

  themeToggle: {
    position: "absolute",
    right: 23,
    top: 52,
    width: 52,
    height: 29,
    backgroundColor: "#d9fff0",
    borderRadius: 30,
    justifyContent: "center",
    paddingLeft: 5,
  },

  logoOuterCircle: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 52,
  },

  logoCircle: {
    width: 114,
    height: 114,
    borderRadius: 28,
    backgroundColor: "rgba(112, 203, 169, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  appName: {
    color: "#ffffff",
    fontSize: 31,
    fontWeight: "900",
    marginTop: 15,
  },

  subtitle: {
    color: "#ecfff7",
    fontSize: 14,
    marginTop: 10,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 22,
    gap: 16,
  },

  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  badgeText: {
    color: "#d9fff0",
    fontSize: 11,
    fontWeight: "700",
  },

  formCard: {
    flex: 1,
    backgroundColor: "#f7fbf9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 27,
    paddingTop: 35,
  },

  formTitle: {
    color: "#06361f",
    fontSize: 21,
    fontWeight: "800",
  },

  formSubtitle: {
    color: "#71807a",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 28,
  },

  label: {
    color: "#33413d",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 9,
  },

  input: {
    height: 51,
    borderWidth: 1,
    borderColor: "#a7e7cf",
    borderRadius: 15,
    backgroundColor: "#f0fbf6",
    paddingHorizontal: 17,
    fontSize: 15,
    color: "#123d2b",
    marginBottom: 18,
  },

  passwordBox: {
    height: 51,
    borderWidth: 1,
    borderColor: "#a7e7cf",
    borderRadius: 15,
    backgroundColor: "#f0fbf6",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#123d2b",
  },

  signInButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#9dd8c8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },

  signInText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },

  bottomLine: {
    height: 1,
    backgroundColor: "#d9eee6",
    marginTop: 25,
  },
});