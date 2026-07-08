// app/member/HomeScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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

function formatMonthLabel(value) {
  if (!value) {
    return "Current Month";
  }

  const [year, month] = String(value).split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
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

function mergeMemberAndMonthlyRecord(member, financialRecord) {
  if (!financialRecord) {
    return member;
  }

  return {
    ...member,

    share_capital: financialRecord.share_capital,
    savings: financialRecord.savings,
    special_savings: financialRecord.special_savings,

    regular_loan: financialRecord.regular_loan,
    regular_loan_diminishing: financialRecord.regular_loan_diminishing,
    educational_loan: financialRecord.educational_loan,
    educational_loan_diminishing: financialRecord.educational_loan_diminishing,
    short_term_loan: financialRecord.short_term_loan,
    short_term_loan_diminishing: financialRecord.short_term_loan_diminishing,
    appliance_loan: financialRecord.appliance_loan,
    appliance_loan_diminishing: financialRecord.appliance_loan_diminishing,
    medical_loan: financialRecord.medical_loan,
    medical_loan_diminishing: financialRecord.medical_loan_diminishing,
    petty_cash_loan: financialRecord.petty_cash_loan,
    vehicle_loan: financialRecord.vehicle_loan,
    inter_trading_loan: financialRecord.inter_trading_loan,

    dividend_amount: financialRecord.dividend_amount,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMemberMonthlyFinancials();
  }, [identifier]);

  async function loadMemberMonthlyFinancials(month = "") {
    try {
      if (!member) {
        setLoading(true);
      } else {
        setMonthLoading(true);
      }

      setErrorMessage("");

      const endpoint = month
        ? `/members/${identifier}/monthly-financials?month=${month}`
        : `/members/${identifier}/monthly-financials`;

      const data = await apiRequest(endpoint, "GET");

      const mergedMember = mergeMemberAndMonthlyRecord(
        data.member,
        data.financial_record
      );

      setMember(mergedMember);
      setAvailableMonths(data.available_months || []);
      setSelectedMonth(data.selected_month || month || "");
    } catch (error) {
      setErrorMessage(error.message || "Failed to load member data.");
    } finally {
      setLoading(false);
      setMonthLoading(false);
    }
  }

  function selectMonth(month) {
    if (month === selectedMonth) {
      return;
    }

    loadMemberMonthlyFinancials(month);
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

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMemberMonthlyFinancials(selectedMonth)}
          >
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
    selected_month: selectedMonth,
  };

  return (
    <MemberScreen
      active="Home"
      title={`Welcome back, ${member.full_name}!`}
      subtitle="Here is your cooperative account summary."
    >
      <SectionCard title="View by Month">
        <Text style={styles.monthSubtitle}>
          Showing records for {formatMonthLabel(selectedMonth)}
        </Text>

        {availableMonths.length === 0 ? (
          <Text style={styles.noMonthText}>
            No monthly records yet. Ask the admin to upload or save records.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.monthRow}>
              {availableMonths.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={
                    selectedMonth === month
                      ? styles.monthChipActive
                      : styles.monthChip
                  }
                  onPress={() => selectMonth(month)}
                >
                  <Text
                    style={
                      selectedMonth === month
                        ? styles.monthChipTextActive
                        : styles.monthChipText
                    }
                  >
                    {formatMonthLabel(month)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {monthLoading ? (
          <View style={styles.monthLoadingRow}>
            <ActivityIndicator color={theme.green} size="small" />
            <Text style={styles.monthLoadingText}>Updating month view...</Text>
          </View>
        ) : null}
      </SectionCard>

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
        <InfoRow label="Selected Month" value={formatMonthLabel(selectedMonth)} />
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

  monthSubtitle: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },

  noMonthText: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  monthRow: {
    flexDirection: "row",
    paddingBottom: 4,
  },

  monthChip: {
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "#fffdf5",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  monthChipActive: {
    height: 36,
    borderRadius: 999,
    backgroundColor: theme.green,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  monthChipText: {
    color: theme.greenDark,
    fontSize: 12,
    fontWeight: "900",
  },

  monthChipTextActive: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  monthLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  monthLoadingText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
});