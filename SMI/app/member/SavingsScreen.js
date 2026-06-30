// app/member/SavingsScreen.js

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

export default function SavingsScreen() {
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
            <Text style={styles.avatarText}>MS</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Maria Santos</Text>
            <Text style={styles.memberId}>MBR-00472</Text>
          </View>

          <View style={styles.memberBadge}>
            <Feather name="user" size={12} color="#0074cc" />
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        </View>

        <View style={styles.navArea}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/member/HomeScreen")}
          >
            <Feather name="grid" size={20} color="#708174" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/member/LoansScreen")}
          >
            <Feather name="credit-card" size={20} color="#708174" />
            <Text style={styles.navText}>Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/member/DividendsScreen")}
          >
            <Feather name="trending-up" size={20} color="#708174" />
            <Text style={styles.navText}>Dividends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, styles.navActive]}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#ffffff" />
            <Text style={styles.navActiveText}>Savings</Text>
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
          <Text style={styles.topLabel}>SAVINGS</Text>

          <View style={styles.bellWrap}>
            <Feather name="bell" size={20} color="#697869" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Share Capital</Text>
          <Text style={styles.subtitle}>Compulsory & Voluntary Savings</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>CURRENT BALANCE</Text>
          <Text style={styles.balanceAmount}>₱48,750.00</Text>

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.smallLabel}>COMPULSORY</Text>
              <Text style={styles.smallAmount}>₱36,000.00</Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>VOLUNTARY</Text>
              <Text style={styles.smallAmount}>₱12,750.00</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Monthly History</Text>

          <HistoryItem
            month="Jun 2024"
            details="Comp ₱36,000.00 + Vol ₱12,750.00"
            amount="₱48,750.00"
          />

          <HistoryItem
            month="May 2024"
            details="Comp ₱39,000.00 + Vol ₱7,200.00"
            amount="₱46,200.00"
          />

          <HistoryItem
            month="Apr 2024"
            details="Comp ₱39,000.00 + Vol ₱6,000.00"
            amount="₱45,000.00"
          />

          <HistoryItem
            month="Mar 2024"
            details="Comp ₱37,500.00 + Vol ₱6,000.00"
            amount="₱43,500.00"
          />

          <HistoryItem
            month="Feb 2024"
            details="Comp ₱37,500.00 + Vol ₱6,000.00"
            amount="₱43,500.00"
          />

          <HistoryItem
            month="Jan 2024"
            details="Comp ₱36,000.00 + Vol ₱6,000.00"
            amount="₱42,000.00"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function HistoryItem({ month, details, amount }) {
  return (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.monthText}>{month}</Text>
        <Text style={styles.detailsText}>{details}</Text>
      </View>

      <Text style={styles.historyAmount}>{amount}</Text>
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
    width: 256,
    backgroundColor: "#fbfaf6",
    borderRightWidth: 1,
    borderRightColor: "#ddd8cf",
  },

  brandRow: {
    height: 84,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd8cf",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#174a33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9dd6ff",
    backgroundColor: "#eff9ff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  memberBadgeText: {
    color: "#0074cc",
    fontSize: 12,
    marginLeft: 4,
  },

  navArea: {
    paddingTop: 24,
    paddingHorizontal: 12,
  },

  navItem: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 13,
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
    paddingTop: 22,
    paddingBottom: 26,
  },

  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 28,
  },

  bottomText: {
    fontSize: 16,
    color: "#526758",
    marginLeft: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 385,
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
    letterSpacing: 3,
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

  header: {
    marginTop: 20,
    marginBottom: 24,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#001c13",
    fontFamily: "serif",
  },

  subtitle: {
    color: "#174a33",
    fontSize: 13,
    marginTop: 5,
  },

  balanceCard: {
    height: 147,
    backgroundColor: "#245f40",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 22,
  },

  cardLabel: {
    color: "#9eb5a5",
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "800",
  },

  balanceAmount: {
    color: "#fff8e8",
    fontSize: 39,
    fontWeight: "800",
    marginTop: 12,
    fontFamily: "serif",
  },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "64%",
    marginTop: 16,
  },

  smallLabel: {
    color: "#9eb5a5",
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "800",
  },

  smallAmount: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
  },

  historyCard: {
    backgroundColor: "#fbfaf6",
    borderWidth: 1,
    borderColor: "#ddd8cf",
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 40,
  },

  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001c13",
    marginBottom: 15,
  },

  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  monthText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001c13",
  },

  detailsText: {
    fontSize: 10,
    color: "#174a33",
    marginTop: 5,
  },

  historyAmount: {
    color: "#009060",
    fontSize: 13,
    fontWeight: "800",
  },
});