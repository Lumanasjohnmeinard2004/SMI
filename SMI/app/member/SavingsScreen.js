//member/SavingsScreen.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  theme,
} from "../../components/MemberUI";

export default function SavingsScreen() {
  return (
    <MemberScreen
      active="Savings"
      title="Share Capital"
      subtitle="Compulsory and voluntary savings."
    >
      <PrimaryCard label="CURRENT BALANCE" amount="₱48,750.00">
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.smallLabel}>COMPULSORY</Text>
            <Text style={styles.smallAmount}>₱36,000.00</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>VOLUNTARY</Text>
            <Text style={styles.smallAmount}>₱12,750.00</Text>
          </View>
        </View>
      </PrimaryCard>

      <SectionCard title="Monthly History">
        <HistoryItem
          month="Jun 2024"
          details="Comp ₱36,000.00 + Vol ₱12,750.00"
          amount="₱48,750.00"
        />
        <HistoryItem
          month="May 2024"
          details="Comp ₱39,000.00 + Vol ₱7,200.00"
          amount="₱46,200.00"
        />
        <HistoryItem
          month="Apr 2024"
          details="Comp ₱39,000.00 + Vol ₱6,000.00"
          amount="₱45,000.00"
        />
        <HistoryItem
          month="Mar 2024"
          details="Comp ₱37,500.00 + Vol ₱6,000.00"
          amount="₱43,500.00"
        />
        <HistoryItem
          month="Feb 2024"
          details="Comp ₱37,500.00 + Vol ₱6,000.00"
          amount="₱43,500.00"
        />
        <HistoryItem
          month="Jan 2024"
          details="Comp ₱36,000.00 + Vol ₱6,000.00"
          amount="₱42,000.00"
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
    borderTopColor: "rgba(255,255,255,0.18)",
  },

  smallLabel: {
    color: "#b7cbbb",
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "900",
  },

  smallAmount: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
  },

  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee9df",
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
    color: theme.green,
    fontSize: 13,
    fontWeight: "900",
  },
});