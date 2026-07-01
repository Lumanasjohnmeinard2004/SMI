import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  MemberScreen,
  SectionCard,
  StatusBadge,
  theme,
} from "../../components/MemberUI";

export default function LoansScreen() {
  return (
    <MemberScreen
      active="Loans"
      title="My Loans"
      subtitle="Member ID: MBR-00472"
    >
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

      <SectionCard>
        <View style={styles.loanHeader}>
          <View>
            <Text style={styles.loanTitle}>Housing Loan</Text>
            <Text style={styles.loanCode}>LN-2022-0017</Text>
          </View>

          <StatusBadge type="settled" text="Settled" />
        </View>

        <View style={styles.settledRow}>
          <Ionicons name="checkmark-circle-outline" size={17} color={theme.success} />
          <Text style={styles.settledText}>
            Fully settled — ₱300,000.00 over term
          </Text>
        </View>
      </SectionCard>
    </MemberScreen>
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
    <SectionCard>
      <View style={styles.loanHeader}>
        <View>
          <Text style={styles.loanTitle}>{title}</Text>
          <Text style={styles.loanCode}>{code}</Text>
        </View>

        <StatusBadge text={status} />
      </View>

      <View style={styles.loanStats}>
        <StatBox label="PRINCIPAL" value={principal} />
        <StatBox label="BALANCE" value={balance} />
        <StatBox label="MONTHLY" value={monthly} />
      </View>

      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>Repaid</Text>
        <Text style={styles.progressLabel}>{percent}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <View style={styles.dueRow}>
        <Feather name="calendar" size={13} color={theme.muted} />
        <Text style={styles.dueText}>Next due: {dueDate}</Text>
      </View>
    </SectionCard>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBar: {
    backgroundColor: theme.green,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  summaryLabel: {
    color: "#b7cbbb",
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: "900",
    marginBottom: 7,
  },

  summaryAmount: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  loanTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loanCode: {
    color: theme.green,
    fontSize: 11,
    marginTop: 5,
  },

  loanStats: {
    flexDirection: "row",
    marginTop: 18,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#e8e2d7",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 7,
  },

  statLabel: {
    color: theme.muted,
    fontSize: 8,
    letterSpacing: 0.8,
    fontWeight: "800",
    marginBottom: 6,
  },

  statValue: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "900",
  },

  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  progressLabel: {
    color: theme.muted,
    fontSize: 12,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#e8e2d7",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: theme.green,
    borderRadius: 8,
  },

  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  dueText: {
    color: theme.muted,
    fontSize: 12,
    marginLeft: 7,
  },

  settledRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  settledText: {
    color: theme.muted,
    fontSize: 13,
    marginLeft: 8,
  },
});