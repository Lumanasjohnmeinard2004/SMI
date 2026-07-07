// app/member/HomeScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SmallCard,
  SectionCard,
  InfoRow,
  HelpButton,
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

function getTotalSavings(member) {
  return (
    Number(member.savings || 0) +
    Number(member.share_capital || 0) +
    Number(member.special_savings || 0)
  );
}

function getTotalLoan(member) {
  return (
    Number(member.regular_loan || 0) +
    Number(member.regular_loan_diminishing || 0) +
    Number(member.educational_loan || 0) +
    Number(member.educational_loan_diminishing || 0) +
    Number(member.short_term_loan || 0) +
    Number(member.short_term_loan_diminishing || 0) +
    Number(member.appliance_loan || 0) +
    Number(member.appliance_loan_diminishing || 0) +
    Number(member.medical_loan || 0) +
    Number(member.medical_loan_diminishing || 0) +
    Number(member.petty_cash_loan || 0) +
    Number(member.vehicle_loan || 0) +
    Number(member.inter_trading_loan || 0)
  );
}

function getActiveLoanCount(member) {
  const loans = [
    member.regular_loan,
    member.regular_loan_diminishing,
    member.educational_loan,
    member.educational_loan_diminishing,
    member.short_term_loan,
    member.short_term_loan_diminishing,
    member.appliance_loan,
    member.appliance_loan_diminishing,
    member.medical_loan,
    member.medical_loan_diminishing,
    member.petty_cash_loan,
    member.vehicle_loan,
    member.inter_trading_loan,
  ];

  return loans.filter((loan) => Number(loan || 0) > 0).length;
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMemberFinancials();
  }, [identifier]);

  async function loadMemberFinancials() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");

      setMember(data.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load member data.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MemberScreen
        active="Home"
        title="Welcome back"
        subtitle="Here is your cooperative account summary."
      >
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading account records...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage || !member) {
    return (
      <MemberScreen
        active="Home"
        title="Welcome back"
        subtitle="Here is your cooperative account summary."
      >
        <SectionCard title="Unable to Load Records">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadMemberFinancials}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>

        <HelpButton />
      </MemberScreen>
    );
  }

  const totalSavings = getTotalSavings(member);
  const totalLoan = getTotalLoan(member);
  const activeLoanCount = getActiveLoanCount(member);

  const memberParams = {
    id: member.id,
    member_id: member.member_id,
    username: member.username,
    full_name: member.full_name,
    status: member.status,
  };

  return (
    <MemberScreen
      active="Home"
      title={`Welcome back, ${member.full_name}!`}
      subtitle="Here is your cooperative account summary."
      member={member}
    >
      <PrimaryCard
        label="TOTAL SAVINGS"
        amount={formatCurrency(totalSavings)}
        sub={`${member.status || "Active"} Member`}
      />

      <View style={styles.cardRow}>
        <SmallCard
          icon="credit-card"
          label="LOAN BALANCE"
          amount={formatCurrency(totalLoan)}
          sub={`${activeLoanCount} active loan${activeLoanCount === 1 ? "" : "s"}`}
          onPress={() =>
            router.push({
              pathname: "/member/LoansScreen",
              params: memberParams,
            })
          }
        />

        <View style={styles.cardGap} />

        <SmallCard
          icon="trending-up"
          label="LAST DIVIDEND"
          amount={formatCurrency(member.dividend_amount)}
          sub="Latest recorded dividend"
          onPress={() =>
            router.push({
              pathname: "/member/DividendsScreen",
              params: memberParams,
            })
          }
        />
      </View>

      <SectionCard title="Quick Overview">
        <InfoRow label="Share Capital" value={formatCurrency(member.share_capital)} />
        <InfoRow label="Savings" value={formatCurrency(member.savings)} />
        <InfoRow label="Special Savings" value={formatCurrency(member.special_savings)} />
        <InfoRow label="Outstanding Loan" value={formatCurrency(totalLoan)} />
        <InfoRow label="Total Dividends" value={formatCurrency(member.dividend_amount)} />
      </SectionCard>

      <HelpButton />
    </MemberScreen>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  cardGap: {
    width: 12,
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