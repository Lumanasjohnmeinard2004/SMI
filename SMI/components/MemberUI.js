// components/MemberUI.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export const theme = {
  bg: "#f4f0e8",
  card: "#fbfaf6",
  border: "#ddd8cf",
  greenDark: "#043915",
  green: "#166534",
  greenHover: "#14532d",
  greenSoft: "#e8f5ed",
  text: "#001c13",
  muted: "#607163",
  gold: "#c4ae42",
  danger: "#b42318",
  success: "#00a86b",
};

const tabs = [
  {
    label: "Home",
    route: "/member/HomeScreen",
    icon: "home",
    library: "Feather",
  },
  {
    label: "Savings",
    route: "/member/SavingsScreen",
    icon: "piggy-bank-outline",
    library: "MaterialCommunityIcons",
  },
  {
    label: "Loans",
    route: "/member/LoansScreen",
    icon: "credit-card",
    library: "Feather",
  },
  {
    label: "Dividend",
    route: "/member/DividendsScreen",
    icon: "trending-up",
    library: "Feather",
  },
  {
    label: "Requests",
    route: "/member/RequestsScreen",
    icon: "clipboard",
    library: "Feather",
  },
  {
    label: "Profile",
    route: "/member/ProfileScreen",
    icon: "user",
    library: "Feather",
  },
];

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

export function MemberScreen({ active, title, subtitle, children }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 768;
  const phoneHeight = Math.min(height - 32, 900);

  const memberParams = {
    id: params.id,
    member_id: params.member_id,
    username: params.username,
    full_name: params.full_name,
    status: params.status,
  };

  const displayName = params.full_name || "Member";
  const displayId = params.member_id || params.username || "Member ID";
  const avatarText = initialsFromName(displayName);

  const content = (
    <View style={styles.app}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="piggy-bank-outline"
              size={21}
              color="#ffffff"
            />
          </View>

          <View style={styles.brandTextWrap}>
            <Text style={styles.brandName}>CoopConnect</Text>
            <Text style={styles.brandSub}>MEMBER PORTAL</Text>
          </View>

          <TouchableOpacity style={styles.bellButton}>
            <Feather name="bell" size={19} color="#ffffff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{displayName}</Text>
            <Text style={styles.memberId}>{displayId}</Text>
          </View>

          <View style={styles.memberBadge}>
            <Feather name="user" size={12} color={theme.green} />
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageTitleWrap}>
          <Text style={styles.pageEyebrow}>{active.toUpperCase()}</Text>
          <Text style={styles.pageTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
        </View>

        {children}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((item) => {
          const selected = item.label === active;

          return (
            <TouchableOpacity
              key={item.label}
              style={styles.tabItem}
              onPress={() =>
                router.push({
                  pathname: item.route,
                  params: memberParams,
                })
              }
            >
              {item.library === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={selected ? theme.green : "#7b897d"}
                />
              ) : (
                <Feather
                  name={item.icon}
                  size={20}
                  color={selected ? theme.green : "#7b897d"}
                />
              )}

              <Text style={selected ? styles.tabTextActive : styles.tabText}>
                {item.label}
              </Text>

              {selected && <View style={styles.tabActiveLine} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (isDesktopWeb) {
    return (
      <SafeAreaView style={styles.webSafe}>
        <View style={styles.webCenter}>
          <View style={[styles.phoneShell, { height: phoneHeight }]}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.greenDark}
            />
            {content}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.greenDark} />
      {content}
    </SafeAreaView>
  );
}

export function PrimaryCard({ label, amount, sub, children }) {
  return (
    <View style={styles.primaryCard}>
      <View style={styles.decorCircle} />
      <Text style={styles.primaryLabel}>{label}</Text>
      <Text style={styles.primaryAmount}>{amount}</Text>
      {!!sub && <Text style={styles.primarySub}>{sub}</Text>}
      {children}
    </View>
  );
}

export function SmallCard({ icon, label, amount, sub, onPress }) {
  return (
    <TouchableOpacity
      style={styles.smallCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.smallIcon}>
        <Feather name={icon} size={18} color={theme.green} />
      </View>

      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={styles.smallAmount}>{amount}</Text>
      {!!sub && <Text style={styles.smallSub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

export function SectionCard({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
}

export function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function StatusBadge({ type = "success", text }) {
  const isPending = type === "pending";
  const isSettled = type === "settled";
  const isDanger = type === "danger";

  return (
    <View
      style={[
        styles.statusBadge,
        isPending && styles.statusPending,
        isSettled && styles.statusSettled,
        isDanger && styles.statusDanger,
      ]}
    >
      <Ionicons
        name={
          isPending
            ? "time-outline"
            : isDanger
            ? "close-circle-outline"
            : "checkmark-circle-outline"
        }
        size={13}
        color={
          isPending
            ? "#e86f00"
            : isDanger
            ? theme.danger
            : isSettled
            ? "#7d8175"
            : theme.success
        }
      />

      <Text
        style={[
          styles.statusText,
          isPending && styles.statusTextPending,
          isSettled && styles.statusTextSettled,
          isDanger && styles.statusTextDanger,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

export function Notice({ title, subtitle }) {
  return (
    <View style={styles.notice}>
      <Ionicons name="time-outline" size={18} color="#e86f00" />

      <View style={{ flex: 1 }}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

export function HelpButton() {
  return (
    <TouchableOpacity style={styles.helpButton}>
      <Text style={styles.helpText}>?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.greenDark,
  },

  webSafe: {
    flex: 1,
    backgroundColor: theme.greenDark,
  },

  webCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  phoneShell: {
    width: 430,
    maxWidth: "100%",
    backgroundColor: theme.bg,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },

  app: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  header: {
    backgroundColor: theme.greenDark,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  brandTextWrap: {
    flex: 1,
  },

  brandName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },

  brandSub: {
    color: "#b7cbbb",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 3,
  },

  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationDot: {
    position: "absolute",
    right: 11,
    top: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.gold,
  },

  memberCard: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },

  memberId: {
    color: "#b7cbbb",
    fontSize: 11,
    marginTop: 3,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef9f1",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  memberBadgeText: {
    color: theme.green,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  content: {
    flex: 1,
  },

  contentInner: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 105,
  },

  pageTitleWrap: {
    marginBottom: 16,
  },

  pageEyebrow: {
    color: theme.green,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "900",
  },

  pageTitle: {
    color: theme.text,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
  },

  pageSubtitle: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 5,
  },

  primaryCard: {
    backgroundColor: theme.green,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    overflow: "hidden",
  },

  decorCircle: {
    position: "absolute",
    right: -38,
    top: -45,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  primaryLabel: {
    color: "#b7cbbb",
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: "900",
  },

  primaryAmount: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 12,
  },

  primarySub: {
    color: "#d2e1d5",
    fontSize: 13,
    marginTop: 8,
  },

  smallCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    padding: 16,
    minHeight: 142,
  },

  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  smallLabel: {
    color: theme.muted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },

  smallAmount: {
    color: theme.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 7,
  },

  smallSub: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 8,
  },

  sectionCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
  },

  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },

  infoRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee9df",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: theme.muted,
    fontSize: 13,
    flex: 1,
  },

  infoValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
    flex: 1.2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafff4",
    borderWidth: 1,
    borderColor: "#83e8b9",
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusPending: {
    backgroundColor: "#fff4df",
    borderColor: "#ffc46b",
  },

  statusSettled: {
    backgroundColor: "#ebe7dd",
    borderColor: "#d1cabd",
  },

  statusDanger: {
    backgroundColor: "#fff0ef",
    borderColor: "#f1b8b8",
  },

  statusText: {
    color: theme.success,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
  },

  statusTextPending: {
    color: "#e86f00",
  },

  statusTextSettled: {
    color: "#7d8175",
  },

  statusTextDanger: {
    color: theme.danger,
  },

  notice: {
    backgroundColor: "#fff9e8",
    borderWidth: 1,
    borderColor: "#f2c94c",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  noticeTitle: {
    color: "#c45f00",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 10,
  },

  noticeSub: {
    color: "#9b4d00",
    fontSize: 11,
    marginLeft: 10,
    marginTop: 4,
  },

  bottomNav: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 14,
    height: 70,
    backgroundColor: theme.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 8,
  },

  tabItem: {
    flex: 1,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  tabText: {
    color: "#7b897d",
    fontSize: 9,
    marginTop: 4,
    fontWeight: "700",
  },

  tabTextActive: {
    color: theme.green,
    fontSize: 9,
    marginTop: 4,
    fontWeight: "900",
  },

  tabActiveLine: {
    position: "absolute",
    bottom: 1,
    width: 22,
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.green,
  },

  helpButton: {
    position: "absolute",
    right: 18,
    bottom: 92,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: theme.greenDark,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  helpText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
});