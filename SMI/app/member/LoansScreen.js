// app/member/LoansScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  MemberScreen,
  SectionCard,
  StatusBadge,
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

function formatDueDate(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

function getLoanList(member) {
  return [
    {
      title: "Regular Loan",
      code: "REGULAR",
      balance: member.regular_loan,
      dueDate: member.regular_loan_due_date,
    },
    {
      title: "Regular Loan - Diminishing",
      code: "REGULAR-DIM",
      balance: member.regular_loan_diminishing,
      dueDate: member.regular_loan_diminishing_due_date,
    },
    {
      title: "Educational Loan",
      code: "EDUC",
      balance: member.educational_loan,
      dueDate: member.educational_loan_due_date,
    },
    {
      title: "Educational Loan - Diminishing",
      code: "EDUC-DIM",
      balance: member.educational_loan_diminishing,
      dueDate: member.educational_loan_diminishing_due_date,
    },
    {
      title: "Short-term Loan",
      code: "SHORT",
      balance: member.short_term_loan,
      dueDate: member.short_term_loan_due_date,
    },
    {
      title: "Short-term Loan - Diminishing",
      code: "SHORT-DIM",
      balance: member.short_term_loan_diminishing,
      dueDate: member.short_term_loan_diminishing_due_date,
    },
    {
      title: "Appliance Loan",
      code: "APP",
      balance: member.appliance_loan,
      dueDate: member.appliance_loan_due_date,
    },
    {
      title: "Appliance Loan - Diminishing",
      code: "APP-DIM",
      balance: member.appliance_loan_diminishing,
      dueDate: member.appliance_loan_diminishing_due_date,
    },
    {
      title: "Medical Loan",
      code: "MED",
      balance: member.medical_loan,
      dueDate: member.medical_loan_due_date,
    },
    {
      title: "Medical Loan - Diminishing",
      code: "MED-DIM",
      balance: member.medical_loan_diminishing,
      dueDate: member.medical_loan_diminishing_due_date,
    },
    {
      title: "Petty Cash Loan",
      code: "PETTY",
      balance: member.petty_cash_loan,
      dueDate: member.petty_cash_loan_due_date,
    },
    {
      title: "Vehicle Loan",
      code: "VEHICLE",
      balance: member.vehicle_loan,
      dueDate: member.vehicle_loan_due_date,
    },
    {
      title: "Inter-Trading Loan",
      code: "INTER",
      balance: member.inter_trading_loan,
      dueDate: member.inter_trading_loan_due_date,
    },
  ];
}

export default function LoansScreen() {
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMemberLoans();
  }, [identifier]);

  async function loadMemberLoans() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");

      setMember(data.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load loan records.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MemberScreen
        active="Loans"
        title="My Loans"
        subtitle="Loading member loan records"
      >
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading loans...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage || !member) {
    return (
      <MemberScreen
        active="Loans"
        title="My Loans"
        subtitle="Unable to load member loan records"
      >
        <SectionCard title="Unable to Load Loans">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadMemberLoans}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      </MemberScreen>
    );
  }

  const totalLoan = getTotalLoan(member);
  const allLoans = getLoanList(member);
  const activeLoans = allLoans.filter((loan) => Number(loan.balance || 0) > 0);

  return (
    <MemberScreen
      active="Loans"
      title="My Loans"
      subtitle={`Member ID: ${member.member_id}`}
    >
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryLabel}>TOTAL AVAILED</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalLoan)}</Text>
        </View>

        <View>
          <Text style={styles.summaryLabel}>OUTSTANDING</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalLoan)}</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.summaryLabel}>ACTIVE</Text>
          <Text style={styles.summaryAmount}>{activeLoans.length}</Text>
        </View>
      </View>

      {activeLoans.length > 0 ? (
        activeLoans.map((loan) => (
          <LoanCard
            key={loan.code}
            title={loan.title}
            code={`${member.member_id}-${loan.code}`}
            status="Current"
            principal={formatCurrency(loan.balance)}
            balance={formatCurrency(loan.balance)}
            monthly="Not set"
            percent="0%"
            dueDate={formatDueDate(loan.dueDate)}
            progressWidth="0%"
          />
        ))
      ) : (
        <SectionCard>
          <View style={styles.loanHeader}>
            <View>
              <Text style={styles.loanTitle}>No Active Loans</Text>
              <Text style={styles.loanCode}>{member.member_id}</Text>
            </View>

            <StatusBadge type="settled" text="Clear" />
          </View>

          <View style={styles.settledRow}>
            <Ionicons name="checkmark-circle-outline" size={17} color={theme.success} />
            <Text style={styles.settledText}>
              This member currently has no outstanding loan balance.
            </Text>
          </View>
        </SectionCard>
      )}

      <SectionCard title="All Loan Types">
        <View style={styles.allLoanList}>
          {allLoans.map((loan) => (
            <View key={`all-${loan.code}`} style={styles.allLoanRow}>
              <View style={styles.allLoanLeft}>
                <Text style={styles.allLoanName}>{loan.title}</Text>
                <Text style={styles.allLoanDue}>
                  Due Date: {formatDueDate(loan.dueDate)}
                </Text>
              </View>

              <Text style={styles.allLoanAmount}>{formatCurrency(loan.balance)}</Text>
            </View>
          ))}
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
    backgroundColor: theme.greenDark,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.gold,
  },

  summaryLabel: {
    color: theme.gold,
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
    fontWeight: "800",
  },

  loanStats: {
    flexDirection: "row",
    marginTop: 18,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#f7f0df",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 7,
    borderWidth: 1,
    borderColor: "#ead8aa",
  },

  statLabel: {
    color: theme.gold,
    fontSize: 8,
    letterSpacing: 0.8,
    fontWeight: "900",
    marginBottom: 6,
  },

  statValue: {
    color: theme.greenDark,
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
    backgroundColor: "#eadfca",
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

  allLoanList: {
    marginTop: 2,
  },

  allLoanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eadfca",
  },

  allLoanLeft: {
    flex: 1,
    paddingRight: 10,
  },

  allLoanName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "700",
  },

  allLoanDue: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 4,
  },

  allLoanAmount: {
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
});n