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

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

import { MemberScreen, SectionCard, theme } from "../../components/MemberUI";

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

 

function getTotalSavings(member) {

  return Number(member.savings || 0) + Number(member.share_capital || 0) + Number(member.special_savings || 0);

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

  return [

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

  ].filter((loan) => Number(loan || 0) > 0).length;

}

 

function mergeMemberAndMonthlyRecord(member, financialRecord) {

  if (!financialRecord) return member;

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

  const identifier = params.member_id || params.username || params.id || params.userId || "msantos";

 

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

      if (!member) setLoading(true);

      else setMonthLoading(true);

      setErrorMessage("");

 

      const endpoint = month

        ? `/members/${identifier}/monthly-financials?month=${month}`

        : `/members/${identifier}/monthly-financials`;

 

      const data = await apiRequest(endpoint, "GET");

      const mergedMember = mergeMemberAndMonthlyRecord(data.member, data.financial_record);

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

    if (month !== selectedMonth) loadMemberMonthlyFinancials(month);

  }

 

  if (loading) {

    return (

      <MemberScreen active="Home" title="Welcome back" subtitle="Here is your cooperative account summary.">

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

      <MemberScreen active="Home" title="Welcome back" subtitle="Here is your cooperative account summary.">

        <SectionCard title="Unable to Load Records">

          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={() => loadMemberMonthlyFinancials(selectedMonth)}>

            <Text style={styles.retryButtonText}>Try Again</Text>

          </TouchableOpacity>

        </SectionCard>

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

      member={member}

    >

      <View style={styles.monthCard}>

        <View style={styles.monthIconWrap}>

          <Feather name="calendar" size={23} color={theme.green} />

        </View>

        <View style={styles.monthTextWrap}>

          <Text style={styles.monthTitle}>VIEW BY MONTH</Text>

          <Text style={styles.monthSubtitle}>Showing records for {formatMonthLabel(selectedMonth)}</Text>

        </View>

 

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthButtons}>

          {availableMonths.length === 0 ? (

            <Text style={styles.noMonthText}>No monthly records.</Text>

          ) : (

            availableMonths.map((month) => (

              <TouchableOpacity

                key={month}

                style={selectedMonth === month ? styles.monthChipActive : styles.monthChip}

                onPress={() => selectMonth(month)}

              >

                <Text style={selectedMonth === month ? styles.monthChipTextActive : styles.monthChipText}>

                  {formatMonthLabel(month)}

                </Text>

              </TouchableOpacity>

            ))

          )}

        </ScrollView>

 

        {monthLoading && <ActivityIndicator color={theme.green} size="small" style={{ marginLeft: 8 }} />}

      </View>

 

      <View style={styles.savingsHero}>

        <View style={styles.savingsDecorOne} />

        <View style={styles.savingsDecorTwo} />

        <View style={styles.savingsIconCircle}>

          <MaterialCommunityIcons name="piggy-bank-outline" size={30} color={theme.gold} />

        </View>

        <View style={styles.savingsContent}>

          <Text style={styles.savingsLabel}>TOTAL SAVINGS</Text>

          <Text style={styles.savingsAmount}>{formatCurrency(totalSavings)}</Text>

          <Text style={styles.savingsStatus}>{member.status || "Active"} Member</Text>

        </View>

      </View>

 

      <View style={styles.cardRow}>

        <DashboardSmallCard

          icon="credit-card"

          label="LOAN BALANCE"

          amount={formatCurrency(totalLoan)}

          sub={`${activeLoanCount} active loan${activeLoanCount === 1 ? "" : "s"}`}

          onPress={() => router.push({ pathname: "/member/LoansScreen", params: memberParams })}

        />

        <View style={styles.cardGap} />

        <DashboardSmallCard

          icon="trending-up"

          label="LAST DIVIDEND"

          amount={formatCurrency(member.dividend_amount)}

          sub="Latest recorded dividend"

          onPress={() => router.push({ pathname: "/member/DividendsScreen", params: memberParams })}

        />

      </View>

 

      <View style={styles.quickCard}>

        <Text style={styles.quickTitle}>QUICK OVERVIEW</Text>

        <QuickRow icon="users" label="Share Capital" value={formatCurrency(member.share_capital)} />

        <QuickRow icon="briefcase" label="Savings" value={formatCurrency(member.savings)} />

        <QuickRow icon="bookmark" label="Special Savings" value={formatCurrency(member.special_savings)} />

        <QuickRow icon="file-text" label="Outstanding Loan" value={formatCurrency(totalLoan)} />

      </View>

    </MemberScreen>

  );

}

 

function DashboardSmallCard({ icon, label, amount, sub, onPress }) {

  return (

    <TouchableOpacity style={styles.smallCard} activeOpacity={0.86} onPress={onPress}>

      <View style={styles.smallCardHeader}>

        <View style={styles.smallIcon}><Feather name={icon} size={22} color={theme.green} /></View>

        <Feather name="chevron-right" size={20} color="#aaa18f" />

      </View>

      <Text style={styles.smallLabel}>{label}</Text>

      <Text style={styles.smallAmount}>{amount}</Text>

      <Text style={styles.smallSub}>{sub}</Text>

    </TouchableOpacity>

  );

}

 

function QuickRow({ icon, label, value }) {

  return (

    <View style={styles.quickRow}>

      <View style={styles.quickIcon}><Feather name={icon} size={20} color={theme.green} /></View>

      <Text style={styles.quickLabel}>{label}</Text>

      <Text style={styles.quickValue}>{value}</Text>

      <Feather name="chevron-right" size={18} color={theme.gold} />

    </View>

  );

}

 

const styles = StyleSheet.create({

  monthCard: {

    backgroundColor: "#ffffff", borderRadius: 22, borderWidth: 1, borderColor: theme.borderSoft,

    padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", flexWrap: "wrap",

  },

  monthIconWrap: { width: 48, height: 48, borderRadius: 18, backgroundColor: "#f8f1df", justifyContent: "center", alignItems: "center", marginRight: 12 },

  monthTextWrap: { flex: 1, minWidth: 180 },

  monthTitle: { color: theme.gold, fontSize: 14, letterSpacing: 1.4, fontWeight: "900" },

  monthSubtitle: { color: theme.muted, fontSize: 12, marginTop: 5, fontWeight: "700" },

  monthButtons: { paddingTop: 12, paddingBottom: 2, alignItems: "center" },

  monthChip: { height: 38, borderRadius: 20, borderWidth: 1, borderColor: theme.gold, backgroundColor: "#ffffff", paddingHorizontal: 16, justifyContent: "center", marginRight: 8 },

  monthChipActive: { height: 38, borderRadius: 20, backgroundColor: theme.green, paddingHorizontal: 16, justifyContent: "center", marginRight: 8 },

  monthChipText: { color: theme.greenDark, fontSize: 12, fontWeight: "900" },

  monthChipTextActive: { color: "#ffffff", fontSize: 12, fontWeight: "900" },

  noMonthText: { color: theme.muted, fontSize: 12 },

  savingsHero: {

    minHeight: 184, backgroundColor: theme.greenDark, borderRadius: 24, borderWidth: 1.2,

    borderColor: theme.gold, padding: 22, marginBottom: 16, overflow: "hidden", flexDirection: "row", alignItems: "center",

  },

  savingsDecorOne: { position: "absolute", right: -40, top: -48, width: 170, height: 170, borderRadius: 85, borderWidth: 2, borderColor: "rgba(201,155,39,0.24)" },

  savingsDecorTwo: { position: "absolute", right: -10, top: -18, width: 110, height: 110, borderRadius: 55, borderWidth: 20, borderColor: "rgba(255,255,255,0.04)" },

  savingsIconCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 1.2, borderColor: theme.gold, backgroundColor: "rgba(201,155,39,0.10)", justifyContent: "center", alignItems: "center", marginRight: 20 },

  savingsContent: { flex: 1 },

  savingsLabel: { color: theme.gold, fontSize: 14, letterSpacing: 1.6, fontWeight: "900" },

  savingsAmount: { color: "#ffffff", fontSize: 33, lineHeight: 40, fontWeight: "900", marginTop: 12 },

  savingsStatus: { color: "#a7ddb7", fontSize: 16, fontWeight: "800", marginTop: 7 },

  cardRow: { flexDirection: "row", marginBottom: 16 },

  cardGap: { width: 12 },

  smallCard: { flex: 1, minHeight: 156, backgroundColor: "#ffffff", borderRadius: 22, borderWidth: 1, borderColor: theme.borderSoft, padding: 16 },

  smallCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  smallIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.greenSoft, justifyContent: "center", alignItems: "center" },

  smallLabel: { color: theme.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1, marginTop: 14 },

  smallAmount: { color: theme.greenDark, fontSize: 18, fontWeight: "900", marginTop: 9 },

  smallSub: { color: theme.muted, fontSize: 11, lineHeight: 16, marginTop: 7 },

  quickCard: { backgroundColor: "#ffffff", borderRadius: 22, borderWidth: 1, borderColor: theme.borderSoft, padding: 18, marginBottom: 16 },

  quickTitle: { color: theme.gold, fontSize: 15, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },

  quickRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee5d5" },

  quickIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.greenSoft, justifyContent: "center", alignItems: "center", marginRight: 10 },

  quickLabel: { flex: 1, color: theme.text, fontSize: 14, fontWeight: "700" },

  quickValue: { color: theme.greenDark, fontSize: 13, fontWeight: "900", marginRight: 8 },

  centerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 18 },

  loadingText: { color: theme.muted, fontSize: 13, marginTop: 10, fontWeight: "700" },

  errorText: { color: "#b91c1c", fontSize: 13, lineHeight: 20, marginBottom: 14 },

  retryButton: { backgroundColor: theme.green, borderRadius: 12, paddingVertical: 12, alignItems: "center" },

  retryButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },

});


