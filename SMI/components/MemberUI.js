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

import SmiLogo from "./SmiLogo";

 

export const theme = {

  bg: "#fffdf8",

  card: "#ffffff",

  cardSoft: "#f8fbf8",

  border: "#d5a72d",

  borderSoft: "#eadfca",

  greenDark: "#003f24",

  green: "#08733f",

  greenMid: "#0c5d38",

  greenSoft: "#e7f6ec",

  text: "#06351f",

  muted: "#68766e",

  gold: "#c99b27",

  danger: "#b42318",

  success: "#087a44",

};

 

const tabs = [

  { label: "Home", route: "/member/HomeScreen", icon: "home", library: "Feather" },

  { label: "Savings", route: "/member/SavingsScreen", icon: "piggy-bank-outline", library: "MaterialCommunityIcons" },

  { label: "Loans", route: "/member/LoansScreen", icon: "credit-card", library: "Feather" },

  { label: "Dividend", route: "/member/DividendsScreen", icon: "trending-up", library: "Feather" },

  { label: "Requests", route: "/member/RequestsScreen", icon: "clipboard", library: "Feather" },

  { label: "Profile", route: "/member/ProfileScreen", icon: "user", library: "Feather" },

];

 

function initialsFromName(name) {

  const words = String(name || "Member").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "MB";

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();

}

 

export function MemberScreen({ active, title, subtitle, children, member, hidePageTitle = false }) {

  const router = useRouter();

  const params = useLocalSearchParams();

  const { width, height } = useWindowDimensions();

 

  const isDesktopWeb = Platform.OS === "web" && width >= 768;

  const phoneHeight = Math.min(Math.max(height - 28, 720), 980);

 

  const displayName = member?.full_name || params.full_name || params.name || "Member";

  const displayId = member?.member_id || params.member_id || params.username || "Member ID";

  const avatarText = initialsFromName(displayName);

 

  const memberParams = {

    id: member?.id || params.id,

    member_id: member?.member_id || params.member_id,

    username: member?.username || params.username,

    full_name: member?.full_name || params.full_name,

    status: member?.status || params.status,

  };

 

  const content = (

    <View style={styles.app}>

      <View style={styles.header}>

        <View style={styles.headerArcOne} />

        <View style={styles.headerArcTwo} />

 

        <View style={styles.brandRow}>

          <View style={styles.brandLeft}>

            <View style={styles.logoRing}>

              <SmiLogo size={52} />

            </View>

            <View style={styles.brandTextWrap}>

              <Text style={styles.brandName}>SMI Coop</Text>

              <Text style={styles.brandSub}>MEMBER PORTAL</Text>

            </View>

          </View>

 

          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>

            <Feather name="bell" size={23} color="#f5cf62" />

            <View style={styles.notificationDot} />

          </TouchableOpacity>

        </View>

 

        <View style={styles.memberCard}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>{avatarText}</Text>

          </View>

 

          <View style={styles.memberInfo}>

            <Text style={styles.memberName} numberOfLines={1}>{displayName}</Text>

            <Text style={styles.memberId} numberOfLines={1}>{displayId}</Text>

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

        {!hidePageTitle && (

          <View style={styles.pageTitleCard}>

            <View style={styles.pageAccent} />

            <View style={{ flex: 1 }}>

              <Text style={styles.pageEyebrow}>{String(active || "Member").toUpperCase()}</Text>

              <Text style={styles.pageTitle}>{title}</Text>

              {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}

            </View>

          </View>

        )}

 

        {children}

      </ScrollView>

 

      <View style={styles.bottomNav}>

        {tabs.map((item) => {

          const selected = item.label === active;

          return (

            <TouchableOpacity

              key={item.label}

              style={[styles.tabItem, selected && styles.tabItemSelected]}

              activeOpacity={0.82}

              onPress={() => router.replace({ pathname: item.route, params: memberParams })}

            >

              {item.library === "MaterialCommunityIcons" ? (

                <MaterialCommunityIcons name={item.icon} size={22} color={selected ? theme.gold : "#e7f2eb"} />

              ) : (

                <Feather name={item.icon} size={22} color={selected ? theme.gold : "#e7f2eb"} />

              )}

              <Text style={selected ? styles.tabTextActive : styles.tabText}>{item.label}</Text>

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

 

export function PrimaryCard({ label, amount, sub, children, icon = "pie-chart" }) {

  return (

    <View style={styles.primaryCard}>

      <View style={styles.primaryGlowOne} />

      <View style={styles.primaryGlowTwo} />

      <View style={styles.primaryTopRow}>

        <View style={styles.primaryIconCircle}>

          <Feather name={icon} size={23} color={theme.gold} />

        </View>

        <Text style={styles.primaryLabel}>{label}</Text>

      </View>

      <Text style={styles.primaryAmount}>{amount}</Text>

      {!!sub && <Text style={styles.primarySub}>{sub}</Text>}

      {children}

    </View>

  );

}

 

export function SmallCard({ icon, label, amount, sub, onPress }) {

  return (

    <TouchableOpacity style={styles.smallCard} onPress={onPress} activeOpacity={0.86}>

      <View style={styles.smallCardTop}>

        <View style={styles.smallIcon}>

          <Feather name={icon} size={20} color={theme.green} />

        </View>

        {!!onPress && <Feather name="chevron-right" size={20} color="#b1a995" />}

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

      {!!title && (

        <View style={styles.sectionHeadingRow}>

          <View style={styles.sectionHeadingLine} />

          <Text style={styles.sectionTitle}>{title}</Text>

        </View>

      )}

      {children}

    </View>

  );

}

 

export function InfoRow({ label, value }) {

  return (

    <View style={styles.infoRow}>

      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>

      <Feather name="chevron-right" size={16} color="#c6ae70" />

    </View>

  );

}

 

export function StatusBadge({ type = "success", text }) {

  const isPending = type === "pending";

  const isSettled = type === "settled";

  const isDanger = type === "danger";

  return (

    <View style={[

      styles.statusBadge,

      isPending && styles.statusPending,

      isSettled && styles.statusSettled,

      isDanger && styles.statusDanger,

    ]}>

      <Ionicons

        name={isPending ? "time-outline" : isDanger ? "close-circle-outline" : "checkmark-circle-outline"}

        size={13}

        color={isPending ? "#d97706" : isDanger ? theme.danger : isSettled ? "#7d8175" : theme.success}

      />

      <Text style={[

        styles.statusText,

        isPending && styles.statusTextPending,

        isSettled && styles.statusTextSettled,

        isDanger && styles.statusTextDanger,

      ]}>{text}</Text>

    </View>

  );

}

 

export function Notice({ title, subtitle }) {

  return (

    <View style={styles.notice}>

      <View style={styles.noticeIcon}>

        <Ionicons name="information-circle-outline" size={20} color={theme.gold} />

      </View>

      <View style={{ flex: 1 }}>

        <Text style={styles.noticeTitle}>{title}</Text>

        <Text style={styles.noticeSub}>{subtitle}</Text>

      </View>

    </View>

  );

}

 

export function HelpButton() {

  return (

    <TouchableOpacity style={styles.helpButton} activeOpacity={0.85}>

      <Text style={styles.helpText}>?</Text>

    </TouchableOpacity>

  );

}

 

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: theme.bg },

  webSafe: { flex: 1, backgroundColor: "#07100b" },

  webCenter: { flex: 1, justifyContent: "center", alignItems: "center", padding: 14 },

  phoneShell: {

    width: 430,

    maxWidth: "100%",

    backgroundColor: theme.bg,

    borderRadius: 34,

    overflow: "hidden",

    borderWidth: 1.4,

    borderColor: theme.gold,

    shadowColor: "#000",

    shadowOpacity: 0.32,

    shadowRadius: 24,

    elevation: 18,

  },

  app: { flex: 1, backgroundColor: theme.bg },

  header: {

    backgroundColor: theme.greenDark,

    paddingHorizontal: 22,

    paddingTop: Platform.OS === "ios" ? 10 : 18,

    paddingBottom: 48,

    borderBottomLeftRadius: 50,

    borderBottomRightRadius: 50,

    overflow: "hidden",

  },

  headerArcOne: {

    position: "absolute", width: 230, height: 230, borderRadius: 115,

    borderWidth: 1, borderColor: "rgba(201,155,39,0.18)", right: -88, top: -45,

  },

  headerArcTwo: {

    position: "absolute", width: 310, height: 310, borderRadius: 155,

    borderWidth: 1, borderColor: "rgba(201,155,39,0.10)", right: -115, top: -85,

  },

  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  brandLeft: { flexDirection: "row", alignItems: "center", flex: 1 },

  logoRing: {

    width: 62, height: 62, borderRadius: 31, backgroundColor: "#ffffff",

    borderWidth: 2, borderColor: theme.gold, justifyContent: "center", alignItems: "center", overflow: "hidden",

  },

  brandTextWrap: { flex: 1, marginLeft: 14 },

  brandName: { color: "#ffffff", fontSize: 24, fontWeight: "900", letterSpacing: 0.2 },

  brandSub: { color: theme.gold, fontSize: 12, letterSpacing: 3.6, marginTop: 4, fontWeight: "900" },

  bellButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },

  notificationDot: { position: "absolute", right: 7, top: 7, width: 9, height: 9, borderRadius: 5, backgroundColor: "#ee7d32" },

  memberCard: {

    marginTop: 24, backgroundColor: "rgba(1,52,31,0.93)", borderWidth: 1.3, borderColor: theme.gold,

    borderRadius: 26, padding: 17, minHeight: 104, flexDirection: "row", alignItems: "center",

    shadowColor: "#00180d", shadowOpacity: 0.28, shadowRadius: 14, elevation: 8,

  },

  avatar: {

    width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(201,155,39,0.13)",

    borderWidth: 1.4, borderColor: theme.gold, justifyContent: "center", alignItems: "center", marginRight: 16,

  },

  avatarText: { color: theme.gold, fontSize: 26, fontWeight: "900" },

  memberInfo: { flex: 1, minWidth: 0 },

  memberName: { color: "#ffffff", fontSize: 22, fontWeight: "900" },

  memberId: { color: "#dce9e1", fontSize: 15, marginTop: 6 },

  memberBadge: {

    flexDirection: "row", alignItems: "center", backgroundColor: "#f7fff9", borderRadius: 999,

    paddingHorizontal: 15, paddingVertical: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6,

  },

  memberBadgeText: { color: theme.green, fontSize: 13, fontWeight: "900", marginLeft: 6 },

  content: { flex: 1, marginTop: -26 },

  contentInner: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 112 },

  pageTitleCard: {

    backgroundColor: "#ffffff", borderRadius: 22, padding: 20, marginBottom: 18,

    borderWidth: 1, borderColor: theme.borderSoft, flexDirection: "row", shadowColor: "#0b2a1a",

    shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,

  },

  pageAccent: { width: 5, borderRadius: 4, backgroundColor: theme.gold, marginRight: 14 },

  pageEyebrow: { color: theme.gold, fontSize: 12, letterSpacing: 1.8, fontWeight: "900" },

  pageTitle: { color: theme.text, fontSize: 28, lineHeight: 34, fontWeight: "900", marginTop: 7 },

  pageSubtitle: { color: "#5d6f66", fontSize: 14, marginTop: 6, lineHeight: 20 },

  primaryCard: {

    minHeight: 178, backgroundColor: theme.greenDark, borderRadius: 24, padding: 22,

    marginBottom: 16, overflow: "hidden", borderWidth: 1.2, borderColor: theme.gold,

    justifyContent: "center", shadowColor: "#002c18", shadowOpacity: 0.16, shadowRadius: 12, elevation: 5,

  },

  primaryGlowOne: { position: "absolute", right: -34, top: -44, width: 160, height: 160, borderRadius: 80, borderWidth: 14, borderColor: "rgba(255,255,255,0.05)" },

  primaryGlowTwo: { position: "absolute", right: -72, top: -82, width: 240, height: 240, borderRadius: 120, borderWidth: 2, borderColor: "rgba(201,155,39,0.15)" },

  primaryTopRow: { flexDirection: "row", alignItems: "center" },

  primaryIconCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: theme.gold, backgroundColor: "rgba(201,155,39,0.12)", justifyContent: "center", alignItems: "center", marginRight: 13 },

  primaryLabel: { color: theme.gold, fontSize: 13, letterSpacing: 2, fontWeight: "900", flex: 1 },

  primaryAmount: { color: "#ffffff", fontSize: 34, lineHeight: 42, fontWeight: "900", marginTop: 18 },

  primarySub: { color: "#a7ddb7", fontSize: 16, marginTop: 8, fontWeight: "800" },

  smallCard: {

    flex: 1, backgroundColor: "#ffffff", borderWidth: 1, borderColor: theme.borderSoft,

    borderRadius: 22, padding: 17, minHeight: 152, shadowColor: "#0d3c23", shadowOpacity: 0.06,

    shadowRadius: 10, elevation: 2,

  },

  smallCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  smallIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.greenSoft, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#cce7d4" },

  smallLabel: { color: theme.gold, fontSize: 12, letterSpacing: 1.1, fontWeight: "900", marginTop: 15 },

  smallAmount: { color: theme.greenDark, fontSize: 19, fontWeight: "900", marginTop: 10 },

  smallSub: { color: theme.muted, fontSize: 12, lineHeight: 17, marginTop: 8 },

  sectionCard: {

    backgroundColor: "#ffffff", borderWidth: 1, borderColor: theme.borderSoft, borderRadius: 22,

    padding: 18, marginBottom: 16, shadowColor: "#0d3c23", shadowOpacity: 0.05, shadowRadius: 9, elevation: 2,

  },

  sectionHeadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 13 },

  sectionHeadingLine: { width: 22, height: 3, borderRadius: 2, backgroundColor: theme.gold, marginRight: 10 },

  sectionTitle: { color: theme.gold, fontSize: 15, letterSpacing: 1.1, fontWeight: "900", textTransform: "uppercase" },

  infoRow: { borderTopWidth: 1, borderTopColor: "#eee5d5", paddingVertical: 13, flexDirection: "row", alignItems: "center" },

  infoLabel: { color: theme.text, fontSize: 14, flex: 1 },

  infoValue: { color: theme.greenDark, fontSize: 14, fontWeight: "900", textAlign: "right", flex: 1.35, marginRight: 8 },

  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#eafff4", borderWidth: 1, borderColor: "#83e8b9", borderRadius: 13, paddingHorizontal: 9, paddingVertical: 5 },

  statusPending: { backgroundColor: "#fff4df", borderColor: "#ffc46b" },

  statusSettled: { backgroundColor: "#ebe7dd", borderColor: "#d1cabd" },

  statusDanger: { backgroundColor: "#fff0ef", borderColor: "#f1b8b8" },

  statusText: { color: theme.success, fontSize: 11, fontWeight: "900", marginLeft: 4 },

  statusTextPending: { color: "#d97706" },

  statusTextSettled: { color: "#7d8175" },

  statusTextDanger: { color: theme.danger },

  notice: { backgroundColor: "#fff9e8", borderWidth: 1, borderColor: theme.gold, borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center", marginBottom: 16 },

  noticeIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#fff3cf", justifyContent: "center", alignItems: "center", marginRight: 10 },

  noticeTitle: { color: theme.gold, fontSize: 13, fontWeight: "900" },

  noticeSub: { color: "#7a5a12", fontSize: 11, marginTop: 4, lineHeight: 16 },

  bottomNav: {

    position: "absolute", left: 12, right: 12, bottom: 10, height: 82, backgroundColor: theme.greenDark,

    borderRadius: 28, borderWidth: 1.2, borderColor: theme.gold, flexDirection: "row", alignItems: "center",

    justifyContent: "space-around", paddingHorizontal: 4, shadowColor: "#00170c", shadowOpacity: 0.28, shadowRadius: 14, elevation: 12,

  },

  tabItem: { flex: 1, height: 68, justifyContent: "center", alignItems: "center", position: "relative", borderRadius: 20 },

  tabItemSelected: { backgroundColor: "rgba(255,255,255,0.04)" },

  tabText: { color: "#e7f2eb", fontSize: 9, marginTop: 5, fontWeight: "700" },

  tabTextActive: { color: theme.gold, fontSize: 9, marginTop: 5, fontWeight: "900" },

  tabActiveLine: { position: "absolute", bottom: 3, width: 28, height: 3, borderRadius: 3, backgroundColor: theme.gold },

  helpButton: { position: "absolute", right: 18, bottom: 106, width: 40, height: 40, borderRadius: 20, backgroundColor: theme.greenDark, justifyContent: "center", alignItems: "center", elevation: 5 },

  helpText: { color: "#ffffff", fontSize: 21, fontWeight: "800" },

});