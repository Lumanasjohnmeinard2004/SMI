// app/member/DividendsScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  StatusBadge,
  Notice,
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

export default function DividendsScreen() {
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDividends();
  }, [identifier]);

  async function loadDividends() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");
      setMember(data.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load dividends.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MemberScreen active="Dividend" title="Dividends" subtitle="Interest on Share Capital">
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading dividends...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage || !member) {
    return (
      <MemberScreen active="Dividend" title="Dividends" subtitle="Interest on Share Capital">
        <SectionCard title="Unable to Load Dividends">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadDividends}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      </MemberScreen>
    );
  }

  return (
    <MemberScreen
      active="Dividend"
      title="Dividends"
      subtitle="Interest on Share Capital"
      member={member}
    >
      <Notice
        title="Dividend record loaded"
        subtitle="This amount comes from the cooperative database."
      />

      <PrimaryCard
        label="TOTAL DIVIDENDS EARNED"
        amount={formatCurrency(member.dividend_amount)}
        sub="Latest recorded dividend amount"
      />

      <SectionCard title="Dividend History">
        <DividendItem
          year="Latest Record"
          status="Recorded"
          statusType="paid"
          details="Saved from admin manual input"
          amount={formatCurrency(member.dividend_amount)}
        />

        <DividendItem
          year="FY 2024"
          status="Pending"
          statusType="pending"
          details="Rate and release date to be updated by admin"
          amount="—"
        />
      </SectionCard>
    </MemberScreen>
  );
}

function DividendItem({ year, status, statusType, details, amount }) {
  return (
    <View style={styles.dividendItem}>
      <View style={styles.dividendLeft}>
        <View style={styles.yearRow}>
          <Text style={styles.dividendYear}>{year}</Text>
          <StatusBadge
            type={statusType === "pending" ? "pending" : "success"}
            text={status}
          />
        </View>

        <Text style={styles.dividendDetails}>{details}</Text>
      </View>

      <Text style={styles.dividendAmount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dividendItem: {
    borderTopWidth: 1,
    borderTopColor: "#eadfca",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dividendLeft: {
    flex: 1,
    paddingRight: 10,
  },

  yearRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dividendYear: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
    marginRight: 8,
  },

  dividendDetails: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 6,
  },

  dividendAmount: {
    color: theme.greenDark,
    fontSize: 14,
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