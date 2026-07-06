//member/DividendsScreen.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  StatusBadge,
  Notice,
  theme,
} from "../../components/MemberUI";

export default function DividendsScreen() {
  return (
    <MemberScreen
      active="Dividend"
      title="Dividends"
      subtitle="Interest on Share Capital"
    >
      <Notice
        title="FY 2024 dividend pending"
        subtitle="Projected rate: ~13% · Est. Feb 2025"
      />

      <PrimaryCard
        label="TOTAL DIVIDENDS EARNED"
        amount="₱15,050.00"
        sub="Since 2018"
      />

      <SectionCard title="Dividend History">
        <DividendItem
          year="FY 2024"
          status="Pending"
          statusType="pending"
          details="Rate: ~13% · Est. Feb 2025"
          amount="—"
        />

        <DividendItem
          year="FY 2021"
          status="Paid"
          statusType="paid"
          details="Rate: 11% · Feb 20, 2022"
          amount="₱4,400.00"
        />

        <DividendItem
          year="FY 2022"
          status="Paid"
          statusType="paid"
          details="Rate: 10% · Mar 15, 2023"
          amount="₱4,800.00"
        />

        <DividendItem
          year="FY 2023"
          status="Paid"
          statusType="paid"
          details="Rate: 12% · Feb 28, 2024"
          amount="₱5,850.00"
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
    borderTopColor: "#eee9df",
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
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
  },
});