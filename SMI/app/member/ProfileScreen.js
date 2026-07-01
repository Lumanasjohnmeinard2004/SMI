import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  MemberScreen,
  SectionCard,
  InfoRow,
  StatusBadge,
  theme,
} from "../../components/MemberUI";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <MemberScreen
      active="Profile"
      title="My Profile"
      subtitle="Member account information."
    >
      <View style={styles.profileHero}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>MS</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.memberName}>Maria Santos</Text>
          <Text style={styles.memberCode}>MBR-00472</Text>

          <View style={styles.statusWrap}>
            <StatusBadge text="Active Member" />
          </View>
        </View>
      </View>

      <SectionCard title="Account Information">
        <InfoRow label="Full Name" value="Maria Santos" />
        <InfoRow label="Member ID" value="MBR-00472" />
        <InfoRow label="Username" value="msantos" />
        <InfoRow label="Role" value="Normal Member" />
        <InfoRow label="Membership Status" value="Active" />
        <InfoRow label="Member Since" value="2015" />
      </SectionCard>

      <SectionCard title="Contact Information">
        <InfoRow label="Email" value="maria.santos@email.com" />
        <InfoRow label="Phone Number" value="+63 912 345 6789" />
        <InfoRow label="Address" value="Cagayan de Oro City" />
        <InfoRow label="Branch" value="Main Branch" />
      </SectionCard>

      <SectionCard title="Cooperative Details">
        <InfoRow
          label="Cooperative"
          value="Savings Mutual Intercompany Multipurpose Co-op"
        />
        <InfoRow label="Share Capital" value="₱48,750.00" />
        <InfoRow label="Current Loan Balance" value="₱55,600.00" />
        <InfoRow label="Total Dividends Earned" value="₱15,050.00" />
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
});