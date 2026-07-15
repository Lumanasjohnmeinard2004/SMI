// app/member/SavingsScreen.js

 

import React, { useEffect, useState } from "react";

import {

  View,

  Text,

  StyleSheet,

  ActivityIndicator,

  TouchableOpacity,

  ScrollView,

} from "react-native";

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

 

function mergeMemberAndMonthlyRecord(member, financialRecord) {

  if (!financialRecord) {

    return member;

  }

 

  return {

    ...member,

    share_capital: financialRecord.share_capital,

    savings: financialRecord.savings,

    special_savings: financialRecord.special_savings,

    dividend_amount: financialRecord.dividend_amount,

  };

}

 

export default function SavingsScreen() {

  const params = useLocalSearchParams();

 

  const identifier =

    params.member_id || params.username || params.id || params.userId || "msantos";

 

  const initialMonth = params.selected_month || "";

 

  const [member, setMember] = useState(null);

  const [availableMonths, setAvailableMonths] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const [loading, setLoading] = useState(true);

  const [monthLoading, setMonthLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

 

  useEffect(() => {

    loadSavings(initialMonth);

  }, [identifier]);

 

  async function loadSavings(month = "") {

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

 

      setMember(mergeMemberAndMonthlyRecord(data.member, data.financial_record));

      setAvailableMonths(data.available_months || []);

      setSelectedMonth(data.selected_month || month || "");

    } catch (error) {

      setErrorMessage(error.message || "Failed to load savings.");

    } finally {

      setLoading(false);

      setMonthLoading(false);

    }

  }

 

  function selectMonth(month) {

    if (month === selectedMonth) {

      return;

    }

 

    loadSavings(month);

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

 

          <TouchableOpacity

            style={styles.retryButton}

            onPress={() => loadSavings(selectedMonth)}

          >

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

      <SectionCard title="View by Month">

        <Text style={styles.monthSubtitle}>

          Showing records for {formatMonthLabel(selectedMonth)}

        </Text>

 

        {availableMonths.length === 0 ? (

          <Text style={styles.noMonthText}>No monthly records available.</Text>

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

          month="Selected Month"

          details="Current selected record"

          amount={formatMonthLabel(selectedMonth)}

        />

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

