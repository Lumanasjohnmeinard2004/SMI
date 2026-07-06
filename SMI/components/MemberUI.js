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
  bg: "#fffdf5",
  card: "#fffefa",
  cardSoft: "#f7fff9",
  border: "#d8aa3a",
  borderSoft: "#ead8aa",
  greenDark: "#054417",
  green: "#0a7a35",
  greenSoft: "#e8f7ee",
  text: "#05351f",
  muted: "#52635b",
  gold: "#c89b2c",
  danger: "#b42318",
  success: "#009060",
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

  const words = String(name).trim().split(" ").filter(Boolean);

  if (words.length === 0) {
    return "MB";
  }

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
  const phoneHeight = Math.min(height - 32, 940);

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
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark-outline" size={27} color={theme.gold} />
          </View>

          <View style={styles.brandTextWrap}>
            <Text style={styles.brandName}>COOPCONNECT</Text>
            <Text style={styles.brandSub}>MEMBER PORTAL</Text>
          </View>

          <TouchableOpacity style={styles.bellButton}>
            <Feather name="bell" size={24} color="#f4d36f" />
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
            <Feather name="user" size={15} color={theme.green} />
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
                  size={22}
                  color={selected ? theme.gold : "#d7e8dc"}
                />
              ) : (
                <Feather
                  name={item.icon}
                  size={22}
                  color={selected ? theme.gold : "#d7e8dc"}
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
            <StatusBar barStyle="light-content" backgroundColor={theme.greenDark} />
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
      <View style={styles.decorCircleOne} />
      <View style={styles.decorCircleTwo} />
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
      activeOpacity={0.86}
    >
      <View style={styles.smallIcon}>
        <Feather name={icon} size={20} color={theme.green} />
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
      <Ionicons name="information-circle-outline" size={20} color={theme.gold} />

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
    backgroundColor: "#000000",
  },

  webSafe: {
    flex: 1,
    backgroundColor: "#000000",
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
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: theme.gold,
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
    paddingTop: 18,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: theme.gold,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  brandTextWrap: {
    flex: 1,
  },

  brandName: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 3,
  },

  brandSub: {
    color: theme.gold,
    fontSize: 13,
    letterSpacing: 4,
    marginTop: 5,
    fontWeight: "900",
  },

  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  notificationDot: {
    position: "absolute",
    right: 8,
    top: 9,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.gold,
  },

  memberCard: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.4,
    borderColor: theme.gold,
    borderRadius: 20,
    padding: 16,
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(200,155,44,0.16)",
    borderWidth: 1,
    borderColor: "rgba(200,155,44,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: theme.gold,
    fontSize: 25,
    fontWeight: "900",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },

  memberId: {
    color: "#d7e8dc",
    fontSize: 17,
    marginTop: 5,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2fff6",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  memberBadgeText: {
    color: theme.green,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 7,
  },

  content: {
    flex: 1,
  },

  contentInner: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 104,
  },

  pageTitleWrap: {
    marginBottom: 20,
  },

  pageEyebrow: {
    color: theme.gold,
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: "900",
  },

  pageTitle: {
    color: theme.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10,
  },

  pageSubtitle: {
    color: "#42576d",
    fontSize: 15,
    marginTop: 7,
    lineHeight: 22,
  },

  primaryCard: {
    backgroundColor: "#f3fff8",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: theme.gold,
  },

  decorCircleOne: {
    position: "absolute",
    right: -42,
    top: -52,
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: "rgba(10,122,53,0.08)",
  },

  decorCircleTwo: {
    position: "absolute",
    right: -10,
    top: -18,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "rgba(10,122,53,0.06)",
  },

  primaryLabel: {
    color: theme.gold,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "900",
  },

  primaryAmount: {
    color: theme.greenDark,
    fontSize: 38,
    fontWeight: "900",
    marginTop: 18,
  },

  primarySub: {
    color: theme.green,
    fontSize: 17,
    marginTop: 10,
    fontWeight: "700",
  },

  smallCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderWidth: 1.1,
    borderColor: theme.borderSoft,
    borderRadius: 18,
    padding: 17,
    minHeight: 140,
  },

  smallIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#cdeed8",
  },

  smallLabel: {
    color: theme.gold,
    fontSize: 13,
    letterSpacing: 1.4,
    fontWeight: "900",
  },

  smallAmount: {
    color: theme.greenDark,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 11,
  },

  smallSub: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 9,
  },

  sectionCard: {
    backgroundColor: theme.card,
    borderWidth: 1.1,
    borderColor: theme.borderSoft,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    color: theme.gold,
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: "900",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  infoRow: {
    borderTopWidth: 1,
    borderTopColor: "#eadfca",
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: theme.text,
    fontSize: 14,
    flex: 1,
  },

  infoValue: {
    color: theme.greenDark,
    fontSize: 14,
    fontWeight: "900",
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
    borderColor: theme.gold,
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  noticeTitle: {
    color: theme.gold,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 10,
  },

  noticeSub: {
    color: "#7a5a12",
    fontSize: 11,
    marginLeft: 10,
    marginTop: 4,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    backgroundColor: theme.greenDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.3,
    borderBottomWidth: 0,
    borderColor: theme.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  tabItem: {
    flex: 1,
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  tabText: {
    color: "#d7e8dc",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "700",
  },

  tabTextActive: {
    color: theme.gold,
    fontSize: 11,
    marginTop: 5,
    fontWeight: "900",
  },

  tabActiveLine: {
    position: "absolute",
    bottom: 1,
    width: 25,
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.gold,
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