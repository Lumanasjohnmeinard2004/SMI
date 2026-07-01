import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SmallCard,
  SectionCard,
  InfoRow,
  HelpButton,
  theme,
} from "../../components/MemberUI";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <MemberScreen
      active="Home"
      title="Welcome back"
      subtitle="Here is your cooperative account summary."
    >
      <PrimaryCard
        label="TOTAL SAVINGS"
        amount="₱48,750.00"
        sub="Active Member since 2015"
      />

      <View style={styles.cardRow}>
        <SmallCard
          icon="credit-card"
          label="LOAN BALANCE"
          amount="₱55,600.00"
          sub="2 active loans"
          onPress={() => router.push("/member/LoansScreen")}
        />

        <View style={styles.cardGap} />

        <SmallCard
          icon="trending-up"
          label="LAST DIVIDEND"
          amount="₱5,850.00"
          sub="FY 2023 paid"
          onPress={() => router.push("/member/DividendsScreen")}
        />
      </View>

      <SectionCard title="Quick Overview">
        <InfoRow label="Share Capital" value="₱48,750.00" />
        <InfoRow label="Savings" value="₱12,750.00" />
        <InfoRow label="Outstanding Loan" value="₱55,600.00" />
        <InfoRow label="Total Dividends" value="₱15,050.00" />
      </SectionCard>

      <SectionCard title="Latest Update">
        <Text style={styles.updateTitle}>FY 2024 dividend is pending</Text>
        <Text style={styles.updateText}>
          Projected rate is around 13%. Estimated release is February 2025.
        </Text>
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

  updateTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
  },

  updateText: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});