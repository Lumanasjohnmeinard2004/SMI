// app/member/DividendsScreen.js

 

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

 

function formatMonthLabel(value) {

  if (!value) return "Current Month";

  const [year, month] = String(value).split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", { month: "long", year: "numeric" });

}

 

function mergeMemberAndMonthlyRecord(member, financialRecord) {

  if (!financialRecord) return member;

  return { ...member, dividend_amount: financialRecord.dividend_amount };

}

 

export default function DividendsScreen() {

  const params = useLocalSearchParams();

  const identifier = params.member_id || params.username || params.id || params.userId || "msantos";

  const initialMonth = params.selected_month || "";

 

  const [member, setMember] = useState(null);

  const [availableMonths, setAvailableMonths] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const [loading, setLoading] = useState(true);

  const [monthLoading, setMonthLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

 

  useEffect(() => {

    loadDividends(initialMonth);

  }, [identifier]);

 

  async function loadDividends(month = "") {

    try {

      if (!member) setLoading(true);

      else setMonthLoading(true);

      setErrorMessage("");

 

      const endpoint = month

        ? `/members/${identifier}/monthly-financials?month=${month}`

        : `/members/${identifier}/monthly-financials`;

      const data = await apiRequest(endpoint, "GET");

 

      setMember(mergeMemberAndMonthlyRecord(data.member, data.financial_record));

      setAvailableMonths(data.available_months || []);

      setSelectedMonth(data.selected_month || month || "");

    } catch (error) {

      setErrorMessage(error.message || "Failed to load dividends.");

    } finally {

      setLoading(false);

      setMonthLoading(false);

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

          <TouchableOpacity style={styles.retryButton} onPress={() => loadDividends(selectedMonth)}>

            <Text style={styles.retryButtonText}>Try Again</Text>

          </TouchableOpacity>

        </SectionCard>

      </MemberScreen>

    );

  }

 

  return (

    <MemberScreen active="Dividend" title="Dividends" subtitle="Interest on Share Capital" member={member}>

      <SectionCard title="View by Month">

        <Text style={styles.monthSubtitle}>Showing records for {formatMonthLabel(selectedMonth)}</Text>

        {availableMonths.length === 0 ? (

          <Text style={styles.noMonthText}>No monthly records available.</Text>

        ) : (

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>

            <View style={styles.monthRow}>

              {availableMonths.map((month) => (

                <TouchableOpacity

                  key={month}

                  style={selectedMonth === month ? styles.monthChipActive : styles.monthChip}

                  onPress={() => month !== selectedMonth && loadDividends(month)}

                >

                  <Text style={selectedMonth === month ? styles.monthChipTextActive : styles.monthChipText}>

                    {formatMonthLabel(month)}

                  </Text>

                </TouchableOpacity>

              ))}

            </View>

          </ScrollView>

        )}

        {monthLoading && (

          <View style={styles.monthLoadingRow}>

            <ActivityIndicator color={theme.green} size="small" />

            <Text style={styles.monthLoadingText}>Updating month view...</Text>

          </View>

        )}

      </SectionCard>

 

      <Notice

        title="Dividend record loaded"

        subtitle="This amount comes from the selected monthly cooperative database record."

      />

 

      <PrimaryCard

        label="TOTAL DIVIDENDS EARNED"

        amount={formatCurrency(member.dividend_amount)}

        sub={formatMonthLabel(selectedMonth)}

        icon="trending-up"

      />

 

      <SectionCard title="Dividend History">

        <View style={styles.dividendItem}>

          <View style={styles.dividendLeft}>

            <View style={styles.yearRow}>

              <Text style={styles.dividendYear}>{formatMonthLabel(selectedMonth)}</Text>

              <StatusBadge type="success" text="Recorded" />

            </View>

            <Text style={styles.dividendDetails}>Saved from admin monthly record</Text>

          </View>

          <Text style={styles.dividendAmount}>{formatCurrency(member.dividend_amount)}</Text>

        </View>

      </SectionCard>

    </MemberScreen>

  );

}

 

const styles = StyleSheet.create({

  dividendItem: { borderTopWidth: 1, borderTopColor: "#eadfca", paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  dividendLeft: { flex: 1, paddingRight: 10 },

  yearRow: { flexDirection: "row", alignItems: "center" },

  dividendYear: { color: theme.text, fontSize: 15, fontWeight: "900", marginRight: 8 },

  dividendDetails: { color: theme.muted, fontSize: 11, marginTop: 6 },

  dividendAmount: { color: theme.greenDark, fontSize: 14, fontWeight: "900" },

  centerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 18 },

  loadingText: { color: theme.muted, fontSize: 13, marginTop: 10, fontWeight: "700" },

  errorText: { color: "#b91c1c", fontSize: 13, lineHeight: 20, marginBottom: 14 },

  retryButton: { backgroundColor: theme.green, borderRadius: 12, paddingVertical: 12, alignItems: "center" },

  retryButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },

  monthSubtitle: { color: theme.muted, fontSize: 12, fontWeight: "700", marginBottom: 12 },

  noMonthText: { color: theme.muted, fontSize: 12, lineHeight: 18 },

  monthRow: { flexDirection: "row", paddingBottom: 4 },

  monthChip: { height: 38, borderRadius: 20, borderWidth: 1, borderColor: theme.gold, backgroundColor: "#ffffff", paddingHorizontal: 14, justifyContent: "center", alignItems: "center", marginRight: 8 },

  monthChipActive: { height: 38, borderRadius: 20, backgroundColor: theme.green, paddingHorizontal: 14, justifyContent: "center", alignItems: "center", marginRight: 8 },

  monthChipText: { color: theme.greenDark, fontSize: 12, fontWeight: "900" },

  monthChipTextActive: { color: "#ffffff", fontSize: 12, fontWeight: "900" },

  monthLoadingRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },

  monthLoadingText: { color: theme.muted, fontSize: 12, fontWeight: "700", marginLeft: 8 },

});