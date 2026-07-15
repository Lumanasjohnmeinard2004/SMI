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

 

  const identifier =

    params.member_id ||

    params.username ||

    params.id ||

    params.userId ||

    "msantos";

 

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

    if (month !== selectedMonth) {

      loadMemberMonthlyFinancials(month);

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

 

          <TouchableOpacity

            style={styles.retryButton}

            onPress={() => loadMemberMonthlyFinancials(selectedMonth)}

          >

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

      hidePageTitle

    >

      <View style={styles.welcomeCard}>

        <View style={styles.watermarkSun} />

        <MaterialCommunityIcons

          name="home-city-outline"

          size={116}

          color="rgba(146, 194, 127, 0.20)"

          style={styles.watermarkHouse}

        />

 

        <Text style={styles.welcomeEyebrow}>HOME</Text>

 

        <Text style={styles.welcomeTitle}>

          Welcome back, {member.full_name}!

        </Text>

 

        <Text style={styles.welcomeSubtitle}>

          Here is your cooperative account summary.

        </Text>

      </View>

 

      <View style={styles.monthCard}>

        <View style={styles.monthIconWrap}>

          <Feather name="calendar" size={21} color={theme.green} />

        </View>

 

        <View style={styles.monthTextWrap}>

          <Text style={styles.monthTitle}>VIEW BY MONTH</Text>

          <Text style={styles.monthSubtitle}>

            Showing records for {formatMonthLabel(selectedMonth)}

          </Text>

        </View>

 

        <ScrollView

          horizontal

          showsHorizontalScrollIndicator={false}

          style={styles.monthScroller}

          contentContainerStyle={styles.monthButtons}

        >

          {availableMonths.length === 0 ? (

            <Text style={styles.noMonthText}>No monthly records.</Text>

          ) : (

            availableMonths.map((month) => (

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

            ))

          )}

        </ScrollView>

 

        {monthLoading && (

          <ActivityIndicator

            color={theme.green}

            size="small"

            style={styles.monthLoader}

          />

        )}

      </View>

 

      <View style={styles.savingsHero}>

        <View style={styles.circleLarge} />

        <View style={styles.circleMiddle} />

        <View style={styles.circleSmall} />

 

        <View style={styles.goldLine} />

 

        <View style={styles.savingsIconCircle}>

          <MaterialCommunityIcons

            name="piggy-bank-outline"

            size={31}

            color={theme.gold}

          />

        </View>

 

        <View style={styles.savingsDivider} />

 

        <View style={styles.savingsContent}>

          <Text style={styles.savingsLabel}>TOTAL SAVINGS</Text>

 

          <Text

            style={styles.savingsAmount}

            numberOfLines={1}

            adjustsFontSizeToFit

            minimumFontScale={0.70}

          >

            {formatCurrency(totalSavings)}

          </Text>

 

          <Text style={styles.savingsStatus}>

            {member.status || "Active"} Member

          </Text>

        </View>

      </View>

 

      <View style={styles.cardRow}>

        <DashboardSmallCard

          icon="credit-card"

          label="LOAN BALANCE"

          amount={formatCurrency(totalLoan)}

          sub={`${activeLoanCount} active loan${

            activeLoanCount === 1 ? "" : "s"

          }`}

          onPress={() =>

            router.push({

              pathname: "/member/LoansScreen",

              params: memberParams,

            })

          }

        />

 

        <View style={styles.cardGap} />

 

        <DashboardSmallCard

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

 

      <View style={styles.quickCard}>

        <Text style={styles.quickTitle}>QUICK OVERVIEW</Text>

 

        <QuickRow

          icon="users"

          label="Share Capital"

          value={formatCurrency(member.share_capital)}

        />

 

        <QuickRow

          icon="briefcase"

          label="Savings"

          value={formatCurrency(member.savings)}

        />

 

        <QuickRow

          icon="bookmark"

          label="Special Savings"

          value={formatCurrency(member.special_savings)}

        />

 

        <QuickRow

          icon="file-text"

          label="Outstanding Loan"

          value={formatCurrency(totalLoan)}

        />

      </View>

    </MemberScreen>

  );

}

 

function DashboardSmallCard({ icon, label, amount, sub, onPress }) {

  return (

    <TouchableOpacity

      style={styles.smallCard}

      activeOpacity={0.86}

      onPress={onPress}

    >

      <View style={styles.smallCardHeader}>

        <View style={styles.smallIcon}>

          <Feather name={icon} size={20} color={theme.green} />

        </View>

 

        <Feather name="chevron-right" size={19} color="#aaa18f" />

      </View>

 

      <Text style={styles.smallLabel}>{label}</Text>

 

      <Text

        style={styles.smallAmount}

        numberOfLines={1}

        adjustsFontSizeToFit

        minimumFontScale={0.72}

      >

        {amount}

      </Text>

 

      <Text style={styles.smallSub}>{sub}</Text>

    </TouchableOpacity>

  );

}

 

function QuickRow({ icon, label, value }) {

  return (

    <View style={styles.quickRow}>

      <View style={styles.quickIcon}>

        <Feather name={icon} size={19} color={theme.green} />

      </View>

 

      <Text style={styles.quickLabel}>{label}</Text>

 

      <Text

        style={styles.quickValue}

        numberOfLines={1}

        adjustsFontSizeToFit

        minimumFontScale={0.76}

      >

        {value}

      </Text>

 

      <Feather name="chevron-right" size={17} color={theme.gold} />

    </View>

  );

}

 

const styles = StyleSheet.create({

  welcomeCard: {

    minHeight: 154,

    backgroundColor: "#ffffff",

    borderRadius: 21,

    borderWidth: 1,

    borderColor: theme.borderSoft,

    paddingHorizontal: 19,

    paddingVertical: 19,

    marginBottom: 15,

    overflow: "hidden",

    justifyContent: "center",

  },

 

  watermarkSun: {

    position: "absolute",

    width: 72,

    height: 72,

    borderRadius: 36,

    right: 15,

    top: 24,

    backgroundColor: "rgba(239, 204, 126, 0.25)",

  },

 

  watermarkHouse: {

    position: "absolute",

    right: -10,

    bottom: -13,

  },

 

  welcomeEyebrow: {

    color: theme.gold,

    fontSize: 12,

    letterSpacing: 1.5,

    fontWeight: "900",

  },

 

  welcomeTitle: {

    color: theme.text,

    fontSize: 25,

    lineHeight: 30,

    fontWeight: "900",

    marginTop: 11,

    paddingRight: 80,

  },

 

  welcomeSubtitle: {

    color: theme.muted,

    fontSize: 12,

    lineHeight: 18,

    marginTop: 6,

    paddingRight: 62,

  },

 

  monthCard: {

    minHeight: 92,

    backgroundColor: "#ffffff",

    borderRadius: 21,

    borderWidth: 1,

    borderColor: theme.borderSoft,

    paddingHorizontal: 14,

    paddingVertical: 13,

    marginBottom: 15,

    flexDirection: "row",

    alignItems: "center",

  },

 

  monthIconWrap: {

    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#f8f1df",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 10,

  },

 

  monthTextWrap: {

    width: 135,

    flexShrink: 0,

  },

 

  monthTitle: {

    color: theme.gold,

    fontSize: 12,

    letterSpacing: 1.15,

    fontWeight: "900",

  },

 

  monthSubtitle: {

    color: theme.muted,

    fontSize: 9.5,

    lineHeight: 13,

    marginTop: 4,

    fontWeight: "700",

  },

 

  monthScroller: {

    flex: 1,

    minWidth: 0,

  },

 

  monthButtons: {

    alignItems: "center",

    paddingLeft: 4,

    paddingRight: 2,

  },

 

  monthChip: {

    height: 34,

    borderRadius: 18,

    borderWidth: 1,

    borderColor: theme.gold,

    backgroundColor: "#ffffff",

    paddingHorizontal: 11,

    justifyContent: "center",

    marginLeft: 6,

  },

 

  monthChipActive: {

    height: 34,

    borderRadius: 18,

    backgroundColor: theme.green,

    paddingHorizontal: 11,

    justifyContent: "center",

    marginLeft: 6,

  },

 

  monthChipText: {

    color: theme.greenDark,

    fontSize: 10,

    fontWeight: "900",

  },

 

  monthChipTextActive: {

    color: "#ffffff",

    fontSize: 10,

    fontWeight: "900",

  },

 

  noMonthText: {

    color: theme.muted,

    fontSize: 10,

  },

 

  monthLoader: {

    marginLeft: 4,

  },

 

  savingsHero: {

    minHeight: 166,

    backgroundColor: "#003f24",

    borderRadius: 21,

    borderWidth: 1.2,

    borderColor: theme.gold,

    paddingHorizontal: 18,

    paddingVertical: 18,

    marginBottom: 15,

    overflow: "hidden",

    flexDirection: "row",

    alignItems: "center",

  },

 

  circleLarge: {

    position: "absolute",

    width: 185,

    height: 185,

    borderRadius: 93,

    borderWidth: 2,

    borderColor: "rgba(201, 155, 39, 0.20)",

    right: -72,

    top: -60,

  },

 

  circleMiddle: {

    position: "absolute",

    width: 130,

    height: 130,

    borderRadius: 65,

    backgroundColor: "rgba(62, 135, 75, 0.22)",

    right: -35,

    top: -26,

  },

 

  circleSmall: {

    position: "absolute",

    width: 82,

    height: 82,

    borderRadius: 41,

    backgroundColor: "rgba(0, 58, 33, 0.72)",

    right: -5,

    top: -2,

  },

 

  goldLine: {

    position: "absolute",

    width: 32,

    height: 3,

    borderRadius: 2,

    backgroundColor: theme.gold,

    left: 18,

    top: 17,

  },

 

  savingsIconCircle: {

    width: 68,

    height: 68,

    borderRadius: 34,

    borderWidth: 1.2,

    borderColor: theme.gold,

    backgroundColor: "rgba(201,155,39,0.10)",

    justifyContent: "center",

    alignItems: "center",

  },

 

  savingsDivider: {

    width: 1,

    height: 72,

    backgroundColor: "rgba(201,155,39,0.72)",

    marginHorizontal: 16,

  },

 

  savingsContent: {

    flex: 1,

    minWidth: 0,

    zIndex: 2,

  },

 

  savingsLabel: {

    color: theme.gold,

    fontSize: 12,

    letterSpacing: 1.3,

    fontWeight: "900",

  },

 

  savingsAmount: {

    color: "#ffffff",

    fontSize: 30,

    lineHeight: 36,

    fontWeight: "900",

    marginTop: 9,

  },

 

  savingsStatus: {

    color: "#a7ddb7",

    fontSize: 13,

    fontWeight: "800",

    marginTop: 5,

  },

 

  cardRow: {

    flexDirection: "row",

    marginBottom: 15,

  },

 

  cardGap: {

    width: 11,

  },

 

  smallCard: {

    flex: 1,

    minHeight: 142,

    backgroundColor: "#ffffff",

    borderRadius: 20,

    borderWidth: 1,

    borderColor: theme.borderSoft,

    padding: 15,

  },

 

  smallCardHeader: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },

 

  smallIcon: {

    width: 42,

    height: 42,

    borderRadius: 15,

    backgroundColor: theme.greenSoft,

    justifyContent: "center",

    alignItems: "center",

  },

 

  smallLabel: {

    color: theme.gold,

    fontSize: 10.5,

    fontWeight: "900",

    letterSpacing: 0.9,

    marginTop: 12,

  },

 

  smallAmount: {

    color: theme.greenDark,

    fontSize: 17,

    fontWeight: "900",

    marginTop: 7,

  },

 

  smallSub: {

    color: theme.muted,

    fontSize: 10,

    lineHeight: 14,

    marginTop: 5,

  },

 

  quickCard: {

    backgroundColor: "#ffffff",

    borderRadius: 20,

    borderWidth: 1,

    borderColor: theme.borderSoft,

    paddingHorizontal: 16,

    paddingTop: 16,

    paddingBottom: 6,

    marginBottom: 15,

  },

 

  quickTitle: {

    color: theme.gold,

    fontSize: 14,

    fontWeight: "900",

    letterSpacing: 1,

    marginBottom: 7,

  },

 

  quickRow: {

    minHeight: 49,

    flexDirection: "row",

    alignItems: "center",

    borderTopWidth: 1,

    borderTopColor: "#eee5d5",

  },

 

  quickIcon: {

    width: 32,

    height: 32,

    borderRadius: 11,

    backgroundColor: theme.greenSoft,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 9,

  },

 

  quickLabel: {

    flex: 1,

    color: theme.text,

    fontSize: 12.5,

    fontWeight: "700",

  },

 

  quickValue: {

    maxWidth: 128,

    color: theme.greenDark,

    fontSize: 11.5,

    fontWeight: "900",

    marginRight: 6,

    textAlign: "right",

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