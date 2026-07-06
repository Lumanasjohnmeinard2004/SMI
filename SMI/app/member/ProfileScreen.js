// app/member/ProfileScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MemberScreen,
  SectionCard,
  InfoRow,
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

function initialsFromName(name) {
  if (!name) {
    return "MB";
  }

  const words = String(name).trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
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

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, [identifier]);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");

      setMember(data.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MemberScreen
        active="Profile"
        title="My Profile"
        subtitle="Member account information."
      >
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage || !member) {
    return (
      <MemberScreen
        active="Profile"
        title="My Profile"
        subtitle="Member account information."
      >
        <SectionCard title="Unable to Load Profile">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      </MemberScreen>
    );
  }

  const totalLoan = getTotalLoan(member);

  return (
    <MemberScreen
      active="Profile"
      title="My Profile"
      subtitle="Member account information."
    >
      <View style={styles.profileHero}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>
            {initialsFromName(member.full_name)}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.memberName}>{member.full_name}</Text>
          <Text style={styles.memberCode}>{member.member_id}</Text>

          <View style={styles.statusWrap}>
            <StatusBadge text={`${member.status || "Active"} Member`} />
          </View>
        </View>
      </View>

      <SectionCard title="Account Information">
        <InfoRow label="Full Name" value={member.full_name} />
        <InfoRow label="Member ID" value={member.member_id} />
        <InfoRow label="Username" value={member.username} />
        <InfoRow label="Role" value="Normal Member" />
        <InfoRow label="Membership Status" value={member.status || "Active"} />
        <InfoRow label="Member Since" value="Not set" />
      </SectionCard>

      <SectionCard title="Contact Information">
        <InfoRow label="Email" value="Not set" />
        <InfoRow label="Phone Number" value="Not set" />
        <InfoRow label="Address" value="Not set" />
        <InfoRow label="Branch" value="Main Branch" />
      </SectionCard>

      <SectionCard title="Cooperative Details">
        <InfoRow
          label="Cooperative"
          value="Savings Mutual Intercompany Multipurpose Co-op"
        />
        <InfoRow label="Share Capital" value={formatCurrency(member.share_capital)} />
        <InfoRow label="Savings" value={formatCurrency(member.savings)} />
        <InfoRow label="Special Savings" value={formatCurrency(member.special_savings)} />
        <InfoRow label="Current Loan Balance" value={formatCurrency(totalLoan)} />
        <InfoRow
          label="Total Dividends Earned"
          value={formatCurrency(member.dividend_amount)}
        />
      </SectionCard>

      <SectionCard title="Settings">
        <SettingRow
          icon={<Ionicons name="moon-outline" size={20} color={theme.muted} />}
          label="Dark Mode"
          value="Off"
        />

        <SettingRow
          icon={<Feather name="lock" size={20} color={theme.muted} />}
          label="Security & Privacy"
        />

        <SettingRow
          icon={<Feather name="help-circle" size={20} color={theme.muted} />}
          label="Help & Support"
        />
      </SectionCard>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => router.replace("/")}
      >
        <Feather name="log-out" size={18} color="#ffffff" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </MemberScreen>
  );
}

function SettingRow({ icon, label, value }) {
  return (
    <TouchableOpacity style={styles.settingRow}>
      <View style={styles.settingLeft}>
        {icon}
        <Text style={styles.settingText}>{label}</Text>
      </View>

      {value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={20} color={theme.muted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    backgroundColor: theme.green,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  bigAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.greenDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  bigAvatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
  },

  memberName: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
  },

  memberCode: {
    color: "#b7cbbb",
    fontSize: 12,
    marginTop: 5,
  },

  statusWrap: {
    marginTop: 12,
    alignSelf: "flex-start",
  },

  settingRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee9df",
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingText: {
    color: theme.muted,
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "700",
  },

  settingValue: {
    color: theme.green,
    fontSize: 13,
    fontWeight: "900",
  },

  signOutButton: {
    height: 50,
    backgroundColor: theme.green,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },

  signOutText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
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