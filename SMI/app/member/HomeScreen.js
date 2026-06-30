// app/member/HomeScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={18} color="#fff" />
          </View>

          <View>
            <Text style={styles.brandName}>CoopConnect</Text>
            <Text style={styles.brandSub}>MEMBER PORTAL</Text>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AU</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Admin User</Text>
            <Text style={styles.memberId}>ADM-00001</Text>
          </View>

          <View style={styles.adminBadge}>
            <Feather name="shield" size={12} color="#7b2cff" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        <View style={styles.navArea}>
          <TouchableOpacity style={[styles.navItem, styles.navActive]}>
            <Feather name="grid" size={20} color="#ffffff" />
            <Text style={styles.navActiveText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/member/LoansScreen")}
          >
            <Feather name="credit-card" size={20} color="#708174" />
            <Text style={styles.navText}>Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Feather name="trending-up" size={20} color="#708174" />
            <Text style={styles.navText}>Dividends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#708174" />
            <Text style={styles.navText}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Feather name="users" size={20} color="#708174" />
            <Text style={styles.navText}>Members</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarBottom}>
          <TouchableOpacity style={styles.bottomItem}>
            <Ionicons name="moon-outline" size={20} color="#708174" />
            <Text style={styles.bottomText}>Dark Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem}>
            <Feather name="log-out" size={20} color="#708174" />
            <Text style={styles.bottomText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.topLabel}>HOME</Text>

          <View style={styles.bellWrap}>
            <Feather name="bell" size={20} color="#697869" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <View style={styles.mainCard}>
          <View>
            <Text style={styles.cardLabel}>TOTAL SAVINGS</Text>
            <Text style={styles.totalAmount}>₱0.00</Text>

            <View style={styles.activeRow}>
              <View style={styles.greenDot} />
              <Text style={styles.activeText}>Active Member since 2015</Text>
            </View>
          </View>

          <View style={styles.cardCircle} />
        </View>

        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => router.push("/member/LoansScreen")}
          >
            <Feather name="credit-card" size={20} color="#d49a10" />
            <Text style={styles.infoLabel}>LOAN BALANCE</Text>
            <Text style={styles.infoAmount}>₱0.00</Text>
            <Text style={styles.infoSub}>0 active ›</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Feather name="trending-up" size={20} color="#d49a10" />
            <Text style={styles.infoLabel}>LAST DIVIDEND</Text>
            <Text style={styles.infoAmount}>₱—</Text>
            <Text style={styles.infoSub}>for ›</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpText}>?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f4f0e8",
  },

  sidebar: {
    width: 286,
    backgroundColor: "#fbfaf6",
    borderRightWidth: 1,
    borderRightColor: "#ddd8cf",
  },

  brandRow: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd8cf",
  },

  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#174a33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  brandName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001c13",
  },

  brandSub: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#607163",
    marginTop: 4,
  },

  profileRow: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd8cf",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#174a33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  profileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001c13",
  },

  memberId: {
    fontSize: 10,
    color: "#174a33",
    marginTop: 2,
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d3b6ff",
    backgroundColor: "#f3ebff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  adminBadgeText: {
    color: "#7b2cff",
    fontSize: 12,
    marginLeft: 4,
  },

  navArea: {
    paddingTop: 18,
    paddingHorizontal: 13,
  },

  navItem: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 2,
    borderRadius: 14,
  },

  navActive: {
    backgroundColor: "#174a33",
  },

  navText: {
    fontSize: 16,
    color: "#526758",
    marginLeft: 14,
  },

  navActiveText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    marginLeft: 14,
  },

  sidebarBottom: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#ddd8cf",
    paddingTop: 26,
    paddingBottom: 26,
  },

  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    marginBottom: 28,
  },

  bottomText: {
    fontSize: 16,
    color: "#526758",
    marginLeft: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 220,
  },

  topBar: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: "#d8d2c8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  topLabel: {
    fontSize: 12,
    color: "#697869",
    letterSpacing: 2,
  },

  bellWrap: {
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    right: -1,
    top: -3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#c4ae42",
  },

  mainCard: {
    height: 148,
    marginTop: 28,
    borderRadius: 15,
    backgroundColor: "#21583b",
    paddingHorizontal: 22,
    paddingVertical: 24,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#b5c7b9",
    fontWeight: "800",
  },

  totalAmount: {
    color: "#fff8e8",
    fontSize: 38,
    fontWeight: "800",
    marginTop: 12,
    fontFamily: "serif",
  },

  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#62d6b0",
    marginRight: 8,
  },

  activeText: {
    color: "#d2e1d5",
    fontSize: 14,
  },

  cardCircle: {
    position: "absolute",
    right: -40,
    top: -35,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(139, 181, 151, 0.35)",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 24,
    columnGap: 14,
  },

  infoCard: {
    flex: 1,
    height: 139,
    backgroundColor: "#fbfaf6",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd8cf",
    padding: 20,
  },

  infoLabel: {
    color: "#526758",
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 16,
  },

  infoAmount: {
    color: "#001c13",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
    fontFamily: "serif",
  },

  infoSub: {
    color: "#526758",
    fontSize: 12,
    marginTop: 10,
  },

  helpButton: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  helpText: {
    color: "#fff",
    fontSize: 22,
  },
});