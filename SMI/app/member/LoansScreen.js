// app/member/LoansScreen.js

import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";


export default function LoansScreen() {
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
          <TouchableOpacity style={styles.navItem}>
            <Feather name="grid" size={20} color="#708174" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, styles.navActive]}>
            <Feather name="credit-card" size={20} color="#ffffff" />
            <Text style={styles.navActiveText}>Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity
  style={styles.navItem}
  onPress={() => router.push("/member/DividendsScreen")}
>
  <Feather name="trending-up" size={20} color="#708174" />
  <Text style={styles.navText}>Dividends</Text>
</TouchableOpacity>

          <TouchableOpacity
  style={styles.navItem}
  onPress={() => router.push("/member/SavingsScreen")}
>
  <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#708174" />
  <Text style={styles.navText}>Savings</Text>
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
          <Text style={styles.topLabel}>LOANS</Text>
          <View style={styles.bellWrap}>
            <Feather name="bell" size={20} color="#697869" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>My Loans</Text>
          <Text style={styles.headerId}>MBR-00472</Text>
        </View>

        <View style={styles.summaryBar}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL AVAILED</Text>
            <Text style={styles.summaryAmount}>₱395,000.00</Text>
          </View>

          <View>
            <Text style={styles.summaryLabel}>OUTSTANDING</Text>
            <Text style={styles.summaryAmount}>₱55,600.00</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.summaryLabel}>ACTIVE</Text>
            <Text style={styles.summaryAmount}>2</Text>
          </View>
        </View>

        <LoanCard
          title="Multi-Purpose Loan"
          code="LN-2024-0089"
          status="Current"
          principal="₱80,000.00"
          balance="₱52,400.00"
          monthly="₱4,200.00"
          percent="65%"
          dueDate="Jul 15, 2026"
          progressWidth="65%"
        />

        <LoanCard
          title="Emergency Loan"
          code="LN-2023-0041"
          status="Current"
          principal="₱15,000.00"
          balance="₱3,200.00"
          monthly="₱1,600.00"
          percent="79%"
          dueDate="Dec 15, 2024"
          progressWidth="79%"
        />

        <View style={styles.settledCard}>
          <View style={styles.loanHeader}>
            <View>
              <Text style={styles.loanTitle}>Housing Loan</Text>
              <Text style={styles.loanCode}>LN-2022-0017</Text>
            </View>

            <View style={styles.settledBadge}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#7d8175" />
              <Text style={styles.settledBadgeText}>Settled</Text>
            </View>
          </View>

          <View style={styles.settledRow}>
            <Ionicons name="checkmark-circle-outline" size={17} color="#03b978" />
            <Text style={styles.settledText}>
              Fully settled — ₱300,000.00 over term
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpText}>?</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoanCard({
  title,
  code,
  status,
  principal,
  balance,
  monthly,
  percent,
  dueDate,
  progressWidth,
}) {
  return (
    <View style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <View>
          <Text style={styles.loanTitle}>{title}</Text>
          <Text style={styles.loanCode}>{code}</Text>
        </View>

        <View style={styles.currentBadge}>
          <Ionicons name="checkmark-circle-outline" size={13} color="#00a86b" />
          <Text style={styles.currentBadgeText}>{status}</Text>
        </View>
      </View>

      <View style={styles.loanStats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PRINCIPAL</Text>
          <Text style={styles.statValue}>{principal}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BALANCE</Text>
          <Text style={styles.statValue}>{balance}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MONTHLY</Text>
          <Text style={styles.statValue}>{monthly}</Text>
        </View>
      </View>

      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>Repaid</Text>
        <Text style={styles.progressPercent}>{percent}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <View style={styles.dueRow}>
        <Feather name="calendar" size={13} color="#708174" />
        <Text style={styles.dueText}>Next due: {dueDate}</Text>
      </View>
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
    width: 275,
    backgroundColor: "#fbfaf6",
    borderRightWidth: 1,
    borderRightColor: "#ddd8cf",
  },

  brandRow: {
    height: 84,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
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
    paddingHorizontal: 2,
  },

  navItem: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 1,
    borderRadius: 14,
    marginRight: 12,
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
    paddingTop: 18,
    paddingBottom: 26,
  },

  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
    height: 37,
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

  header: {
    marginTop: 20,
    marginBottom: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#001c13",
    fontFamily: "serif",
  },

  headerId: {
    fontSize: 11,
    color: "#174a33",
    marginTop: 3,
  },

  summaryBar: {
    height: 68,
    borderRadius: 15,
    backgroundColor: "#174a33",
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  summaryLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: "#8ea596",
    fontWeight: "800",
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "800",
  },

  loanCard: {
    backgroundColor: "#fbfaf6",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd8cf",
    padding: 18,
    marginBottom: 15,
  },

  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  loanTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001c13",
  },

  loanCode: {
    fontSize: 10,
    color: "#174a33",
    marginTop: 6,
  },

  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafff4",
    borderWidth: 1,
    borderColor: "#83e8b9",
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  currentBadgeText: {
    color: "#00a86b",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  loanStats: {
    flexDirection: "row",
    marginTop: 20,
    columnGap: 9,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#e8e2d7",
    borderRadius: 9,
    height: 53,
    justifyContent: "center",
    alignItems: "center",
  },

  statLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: "#708174",
    marginBottom: 7,
  },

  statValue: {
    fontSize: 13,
    color: "#001c13",
    fontWeight: "700",
  },

  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  progressLabel: {
    fontSize: 11,
    color: "#526758",
  },

  progressPercent: {
    fontSize: 11,
    color: "#526758",
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#e8e2d7",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#174a33",
    borderRadius: 8,
  },

  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  dueText: {
    fontSize: 11,
    color: "#526758",
    marginLeft: 7,
  },

  settledCard: {
    backgroundColor: "#fbfaf6",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd8cf",
    padding: 18,
    marginBottom: 40,
  },

  settledBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebe7dd",
    borderWidth: 1,
    borderColor: "#d1cabd",
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  settledBadgeText: {
    color: "#7d8175",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  settledRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  settledText: {
    color: "#526758",
    fontSize: 13,
    marginLeft: 8,
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