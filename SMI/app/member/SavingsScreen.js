// app/member/SavingsScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  theme,
} from "../../components/MemberUI";
import { apiRequest } from "../../config/api";

function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return `₱${numberValue.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SavingsScreen() {
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSavings();
  }, [identifier]);

  async function loadSavings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");
      setMember(data.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load savings.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MemberScreen
        active="Savings"
        title="Share Capital"
        subtitle="Compulsory and voluntary savings."
      >
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading savings...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage || !member) {
    return (
      <MemberScreen
        active="Savings"
        title="Share Capital"
        subtitle="Compulsory and voluntary savings."
      >
        <SectionCard title="Unable to Load Savings">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadSavings}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      </MemberScreen>
    );
  }

  const currentBalance =
    Number(member.share_capital || 0) +
    Number(member.savings || 0) +
    Number(member.special_savings || 0);

  return (
    <MemberScreen
      active="Savings"
      title="Share Capital"
      subtitle="Compulsory and voluntary savings."
    >
      <PrimaryCard label="CURRENT BALANCE" amount={formatCurrency(currentBalance)}>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.smallLabel}>SHARE CAPITAL</Text>
            <Text style={styles.smallAmount}>{formatCurrency(member.share_capital)}</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>SAVINGS</Text>
            <Text style={styles.smallAmount}>{formatCurrency(member.savings)}</Text>
          </View>
        </View>
      </PrimaryCard>

      <SectionCard title="Savings Breakdown">
        <HistoryItem
          month="Share Capital"
          details="Capital contribution"
          amount={formatCurrency(member.share_capital)}
        />
        <HistoryItem
          month="Savings"
          details="Regular savings balance"
          amount={formatCurrency(member.savings)}
        />
        <HistoryItem
          month="Special Savings"
          details="Special savings balance"
          amount={formatCurrency(member.special_savings)}
        />
        <HistoryItem
          month="Total Savings"
          details="Share capital + savings + special savings"
          amount={formatCurrency(currentBalance)}
        />
      </SectionCard>
    </MemberScreen>
  );
}

function HistoryItem({ month, details, amount }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.monthText}>{month}</Text>
        <Text style={styles.detailsText}>{details}</Text>
      </View>

      <Text style={styles.historyAmount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(5,68,23,0.15)",
  },

  smallLabel: {
    color: theme.gold,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "900",
  },

  smallAmount: {
    color: theme.greenDark,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
  },

  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eadfca",
    paddingVertical: 14,
  },

  historyLeft: {
    flex: 1,
    paddingRight: 12,
  },

  monthText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
  },

  detailsText: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 5,
  },

  historyAmount: {
    color: theme.greenDark,
    fontSize: 13,
    fontWeight: "900",
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  loadingText: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 10,
    fontWeight: "700",
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },

  retryButton: {
    backgroundColor: theme.green,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});