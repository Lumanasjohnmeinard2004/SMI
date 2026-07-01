// app/admin/AdminDashboardScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <View style={styles.page}>
      <View style={styles.phone}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.time}>9:41</Text>
            <View style={styles.batteryWrap}>
              <View style={styles.battery} />
              <View style={styles.batterySmall} />
            </View>
          </View>

          {activeTab === "overview" && (
            <>
              <View style={styles.portalRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#5ff0b1" />
                <Text style={styles.portalText}>ADMIN PORTAL</Text>
              </View>

              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Cooperative Dashboard</Text>

                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.toggleButton}>
                    <Ionicons name="sunny-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push("/admin/AdminUploadCSVScreen")}
                  >
                    <Feather name="upload-cloud" size={18} color="#80d6b1" />
                    <View style={styles.dot} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {activeTab === "members" && (
            <>
              <Text style={styles.pageTitle}>Member Records</Text>
              <Text style={styles.pageSub}>6 registered members</Text>

              <View style={styles.searchBox}>
                <Feather name="search" size={16} color="#8bb8a2" />
                <Text style={styles.searchText}>Search by name, ID, or username...</Text>
              </View>
            </>
          )}

          {activeTab === "appointments" && (
            <>
              <Text style={styles.pageTitle}>Appointments</Text>
              <Text style={styles.pageSub}>1 pending · 2 total</Text>

              <View style={styles.filterRow}>
                <FilterChip label="All" active />
                <FilterChip label="Pending" />
                <FilterChip label="Confirmed" />
                <FilterChip label="Cancelled" />
              </View>
            </>
          )}

          {activeTab === "profile" && <AdminProfileHeader />}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "members" && <MembersContent />}
          {activeTab === "appointments" && <AppointmentsContent />}
          {activeTab === "profile" && <ProfileContent router={router} />}
        </ScrollView>

        <View style={styles.bottomNav}>
          <BottomTab
            icon="bar-chart-2"
            label="Overview"
            active={activeTab === "overview"}
            onPress={() => setActiveTab("overview")}
          />

          <BottomTab
            icon="users"
            label="Members"
            active={activeTab === "members"}
            onPress={() => setActiveTab("members")}
          />

          <BottomTab
            icon="upload-cloud"
            label="Upload"
            active={false}
            onPress={() => router.push("/admin/AdminUploadCSVScreen")}
          />

          <BottomTab
            icon="calendar"
            label="Appts"
            active={activeTab === "appointments"}
            badge="1"
            onPress={() => setActiveTab("appointments")}
          />

          <BottomTab
            icon="user"
            label="Profile"
            active={activeTab === "profile"}
            onPress={() => setActiveTab("profile")}
          />
        </View>
      </View>
    </View>
  );
}

function OverviewContent() {
  return (
    <View style={styles.overviewWrapper}>
      <View style={styles.statsGrid}>
        <StatCard icon="users" value="6" label="Total Members" sub="5 active" />
        <StatCard
          icon="piggy-bank-outline"
          value="₱283k"
          label="Total Savings"
          sub="Share capital"
          type="material"
        />
        <StatCard icon="credit-card" value="₱369k" label="Total Loans" sub="Outstanding" />
        <StatCard icon="trending-up" value="₱33k" label="Dividends Paid" sub="FY 2024" />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Savings vs Loans · Per Member</Text>

        <View style={styles.chartArea}>
          <View style={styles.yAxis}>
            <Text style={styles.axisText}>120k</Text>
            <Text style={styles.axisText}>60k</Text>
            <Text style={styles.axisText}>30k</Text>
            <Text style={styles.axisText}>0k</Text>
          </View>

          <View style={styles.barGroup}>
            <MiniBar name="Maria" savings={45} loans={65} />
            <MiniBar name="Juan" savings={5} loans={10} />
            <MiniBar name="Lourdes" savings={5} loans={10} />
            <MiniBar name="Roberto" savings={5} loans={10} />
            <MiniBar name="Cristina" savings={120} loans={95} />
            <MiniBar name="Danilo" savings={0} loans={10} />
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#00a86b" }]} />
            <Text style={styles.legendText}>Savings</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#ff7a1a" }]} />
            <Text style={styles.legendText}>Loans</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Members</Text>

      <MemberSmall name="Maria Santos" id="2019-004827" savings="₱52,750.00" status="Caution" />
      <MemberSmall name="Juan dela Cruz" id="2020-005112" savings="₱38,400.00" status="Caution" />
      <MemberSmall name="Lourdes Reyes" id="2018-003991" savings="₱71,200.00" status="Excellent" />
    </View>
  );
}

function MembersContent() {
  return (
    <View style={styles.listWrapper}>
      <MemberRecord
        initial="M"
        name="Maria Santos"
        username="@msantos"
        id="2019-004827"
        savings="₱52,750.00"
        loan="₱84,000.00"
        dividend="₱6,330.00"
        status="Caution"
      />

      <MemberRecord
        initial="J"
        name="Juan dela Cruz"
        username="@jdelacruz"
        id="2020-005112"
        savings="₱38,400.00"
        loan="₱60,000.00"
        dividend="₱4,608.00"
        status="Caution"
      />

      <MemberRecord
        initial="L"
        name="Lourdes Reyes"
        username="@lreyes"
        id="2018-003991"
        savings="₱71,200.00"
        loan="₱0.00"
        dividend="₱8,544.00"
        status="Excellent"
      />

      <MemberRecord
        initial="R"
        name="Roberto Alcantara"
        username="@ralcantara"
        id="2021-006033"
        savings="₱18,600.00"
        loan="₱30,000.00"
        dividend="₱2,232.00"
        status="Suspended"
        suspended
      />

      <MemberRecord
        initial="C"
        name="Cristina Villanueva"
        username="@cvillanueva"
        id="2017-002748"
        savings="₱94,300.00"
        loan="₱120,000.00"
        dividend="₱11,316.00"
        status="Fair"
      />
    </View>
  );
}

function AppointmentsContent() {
  return (
    <View style={styles.appointmentWrapper}>
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.appointmentName}>Maria Santos</Text>
            <Text style={styles.appointmentType}>Loan Application</Text>
          </View>

          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedText}>Confirmed</Text>
          </View>
        </View>

        <Text style={styles.appointmentDetails}>Main Branch · Mar 20, 2025 10:00 AM</Text>
        <Text style={styles.appointmentNote}>Please bring co-maker</Text>
      </View>

      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.appointmentName}>Juan dela Cruz</Text>
            <Text style={styles.appointmentType}>Account Inquiry</Text>
          </View>

          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>

        <Text style={styles.appointmentDetails}>North Branch · Mar 18, 2025 2:00 PM</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.confirmButton}>
            <Feather name="check-square" size={14} color="#009060" />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton}>
            <Feather name="x-circle" size={14} color="#e23b3b" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function AdminProfileHeader() {
  return (
    <View style={styles.adminProfileHeader}>
      <View style={styles.bigAvatar}>
        <Text style={styles.bigAvatarText}>A</Text>
        <View style={styles.cameraCircle}>
          <Feather name="camera" size={13} color="#ffffff" />
        </View>
      </View>

      <Text style={styles.adminName}>Administrator</Text>
      <Text style={styles.adminSub}>SMIMC · System Admin</Text>

      <View style={styles.fullAccessBadge}>
        <Text style={styles.fullAccessText}>• Full Access</Text>
      </View>

      <View style={styles.colorDots}>
        <View style={[styles.colorDot, { backgroundColor: "#19a98a" }]} />
        <View style={[styles.colorDot, styles.colorDotActive, { backgroundColor: "#1594bd" }]} />
        <View style={[styles.colorDot, { backgroundColor: "#8a49df" }]} />
        <View style={[styles.colorDot, { backgroundColor: "#c7681d" }]} />
        <View style={[styles.colorDot, { backgroundColor: "#c92f6a" }]} />
        <View style={[styles.colorDot, { backgroundColor: "#3563d9" }]} />
      </View>
    </View>
  );
}

function ProfileContent({ router }) {
  return (
    <View style={styles.profileContent}>
      <View style={styles.profileStatsCard}>
        <ProfileStat value="6" label="Members" />
        <ProfileStat value="5" label="Active" />
        <ProfileStat value="₱283k" label="Savings" />
      </View>

      <Text style={styles.profileSectionTitle}>Account Info</Text>

      <View style={styles.infoBox}>
        <ProfileRow label="Username" value="admin" />
        <ProfileRow label="Role" value="System Administrator" />
        <ProfileRow label="Access Level" value="Full — All Modules" />
        <ProfileRow label="Cooperative" value="SMIMC" />
        <ProfileRow label="Last Login" value="Today, 9:41 AM" />
      </View>

      <Text style={styles.profileSectionTitle}>Appearance</Text>

      <View style={styles.appearanceCard}>
        <View style={styles.appearanceIcon}>
          <Ionicons name="sunny-outline" size={22} color="#009060" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.darkModeTitle}>Dark Mode</Text>
          <Text style={styles.darkModeSub}>Currently off</Text>
        </View>

        <View style={styles.togglePill}>
          <Ionicons name="sunny-outline" size={14} color="#ffffff" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.profileUploadButton}
        onPress={() => router.push("/admin/AdminUploadCSVScreen")}
      >
        <Feather name="upload-cloud" size={18} color="#009060" />
        <Text style={styles.profileUploadText}>Upload CSV / Manual Input</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileSignOut} onPress={() => router.push("/")}>
        <Feather name="log-out" size={18} color="#e23b3b" />
        <Text style={styles.profileSignOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ icon, value, label, sub, type }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconBox}>
        {type === "material" ? (
          <MaterialCommunityIcons name={icon} size={19} color="#009060" />
        ) : (
          <Feather name={icon} size={19} color="#009060" />
        )}
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function MiniBar({ name, savings, loans }) {
  return (
    <View style={styles.miniBarWrap}>
      <View style={styles.barSlot}>
        <View style={[styles.savingsBar, { height: savings }]} />
        <View style={[styles.loansBar, { height: loans }]} />
      </View>
      <Text style={styles.barName}>{name}</Text>
    </View>
  );
}

function MemberSmall({ name, id, savings, status }) {
  return (
    <View style={styles.memberSmallCard}>
      <View style={styles.smallInitial}>
        <Text style={styles.smallInitialText}>{name[0]}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.memberSmallName}>{name}</Text>
        <Text style={styles.memberSmallId}>{id}</Text>
      </View>

      <View>
        <Text style={styles.memberSavings}>{savings}</Text>
        <View style={styles.cautionBadge}>
          <Ionicons name="shield-outline" size={11} color="#ff6b1a" />
          <Text style={styles.cautionText}>{status}</Text>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color="#9aa8a1" />
    </View>
  );
}

function MemberRecord({
  initial,
  name,
  username,
  id,
  savings,
  loan,
  dividend,
  status,
  suspended,
}) {
  return (
    <View style={styles.memberRecordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordInitial}>
          <Text style={styles.recordInitialText}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.recordName}>{name}</Text>
          <Text style={styles.recordMeta}>
            {username} · {id}
          </Text>
        </View>

        <View
          style={
            status === "Excellent"
              ? styles.excellentBadge
              : status === "Suspended"
              ? styles.suspendedBadge
              : styles.cautionBadge
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={12}
            color={
              status === "Excellent"
                ? "#009060"
                : status === "Suspended"
                ? "#e23b3b"
                : "#ff6b1a"
            }
          />
          <Text
            style={
              status === "Excellent"
                ? styles.excellentText
                : status === "Suspended"
                ? styles.suspendedText
                : styles.cautionText
            }
          >
            {status}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color="#9aa8a1" />
      </View>

      <View style={styles.recordStats}>
        <RecordStat value={savings} label="Savings" color="#009060" />
        <RecordStat value={loan} label="Loan" color="#ff4f00" />
        <RecordStat value={dividend} label="Div" color="#009060" />

        <TouchableOpacity style={styles.suspendBox}>
          <Feather name={suspended ? "unlock" : "lock"} size={12} color="#ff4f00" />
          <Text style={styles.suspendText}>{suspended ? "Restore" : "Suspend"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RecordStat({ value, label, color }) {
  return (
    <View style={styles.recordStat}>
      <Text style={[styles.recordStatValue, { color }]}>{value}</Text>
      <Text style={styles.recordStatLabel}>{label}</Text>
    </View>
  );
}

function BottomTab({ icon, label, active, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomTab} onPress={onPress}>
      <View style={styles.bottomIconWrap}>
        <Feather name={icon} size={20} color={active ? "#37e6a3" : "#50906e"} />
        {badge && (
          <View style={styles.bottomBadge}>
            <Text style={styles.bottomBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={active ? styles.bottomTabActiveText : styles.bottomTabText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active }) {
  return (
    <View style={active ? styles.filterChipActive : styles.filterChip}>
      <Text style={active ? styles.filterChipActiveText : styles.filterChipText}>
        {label}
      </Text>
    </View>
  );
}

function ProfileStat({ value, label }) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

function ProfileRow({ label, value }) {
  return (
    <View style={styles.profileRowInfo}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#005033",
    alignItems: "center",
    justifyContent: "center",
  },

  phone: {
    width: 390,
    height: 844,
    backgroundColor: "#eafff4",
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2b7553",
  },

  header: {
    backgroundColor: "#06472f",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },

  batteryWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  battery: {
    width: 16,
    height: 9,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },

  batterySmall: {
    width: 3,
    height: 7,
    backgroundColor: "#ffffff",
    borderRadius: 1,
    marginLeft: 2,
  },

  portalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  portalText: {
    color: "#5ff0b1",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
    letterSpacing: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#b5f4d5",
    justifyContent: "center",
    paddingLeft: 8,
    marginRight: 8,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1c6346",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    position: "relative",
  },

  dot: {
    position: "absolute",
    right: 7,
    top: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ff7a1a",
  },

  pageTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 18,
  },

  pageSub: {
    color: "#5ff0b1",
    fontSize: 14,
    marginTop: 4,
  },

  searchBox: {
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#4b8d70",
    backgroundColor: "#235f43",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchText: {
    color: "#9fc9b5",
    fontSize: 13,
    marginLeft: 9,
  },

  content: {
    flex: 1,
    backgroundColor: "#eafff4",
  },

  overviewWrapper: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 90,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    height: 130,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  statIconBox: {
    width: 33,
    height: 33,
    borderRadius: 9,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  statValue: {
    color: "#002c1d",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9b8ead",
    fontSize: 12,
    marginTop: 8,
  },

  statSub: {
    color: "#9b8ead",
    fontSize: 11,
    marginTop: 2,
  },

  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginTop: 2,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#002c1d",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },

  chartArea: {
    flexDirection: "row",
    height: 135,
  },

  yAxis: {
    width: 32,
    justifyContent: "space-between",
  },

  axisText: {
    fontSize: 8,
    color: "#a69ab4",
  },

  barGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  miniBarWrap: {
    alignItems: "center",
  },

  barSlot: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  savingsBar: {
    width: 7,
    backgroundColor: "#c9c9c9",
    marginRight: 2,
  },

  loansBar: {
    width: 7,
    backgroundColor: "#ff7a1a",
  },

  barName: {
    fontSize: 8,
    color: "#a69ab4",
    marginTop: 5,
  },

  legendRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },

  legendBox: {
    width: 9,
    height: 9,
    borderRadius: 2,
    marginRight: 5,
  },

  legendText: {
    fontSize: 10,
    color: "#7f8790",
  },

  memberSmallCard: {
    backgroundColor: "#ffffff",
    height: 63,
    borderRadius: 12,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  smallInitial: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#fff1e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  smallInitialText: {
    color: "#ff6b1a",
    fontWeight: "900",
    fontSize: 15,
  },

  memberSmallName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#002c1d",
  },

  memberSmallId: {
    fontSize: 10,
    color: "#7f8790",
    marginTop: 3,
  },

  memberSavings: {
    color: "#009060",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },

  cautionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1e6",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },

  cautionText: {
    color: "#ff6b1a",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },

  listWrapper: {
    padding: 20,
    paddingBottom: 90,
  },

  memberRecordCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 11,
    overflow: "hidden",
  },

  recordHeader: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  recordInitial: {
    width: 41,
    height: 41,
    borderRadius: 10,
    backgroundColor: "#fff1e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  recordInitialText: {
    color: "#ff6b1a",
    fontSize: 16,
    fontWeight: "900",
  },

  recordName: {
    fontSize: 14,
    color: "#002c1d",
    fontWeight: "900",
  },

  recordMeta: {
    color: "#8e91a4",
    fontSize: 10,
    marginTop: 4,
  },

  excellentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6fff2",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  excellentText: {
    color: "#009060",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },

  suspendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe9e9",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  suspendedText: {
    color: "#e23b3b",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },

  recordStats: {
    height: 52,
    borderTopWidth: 1,
    borderTopColor: "#e7eee9",
    flexDirection: "row",
  },

  recordStat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e7eee9",
  },

  recordStatValue: {
    fontSize: 10,
    fontWeight: "900",
  },

  recordStatLabel: {
    fontSize: 9,
    color: "#8e91a4",
    marginTop: 3,
  },

  suspendBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  suspendText: {
    color: "#ff4f00",
    fontSize: 10,
    marginTop: 3,
  },

  appointmentWrapper: {
    padding: 20,
  },

  filterRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  filterChip: {
    backgroundColor: "#1b6646",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: "#1b6646",
    borderWidth: 1,
    borderColor: "#20d291",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },

  filterChipText: {
    color: "#8bd4b4",
    fontSize: 12,
    fontWeight: "700",
  },

  filterChipActiveText: {
    color: "#20d291",
    fontSize: 12,
    fontWeight: "700",
  },

  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
  },

  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  appointmentName: {
    color: "#002c1d",
    fontSize: 14,
    fontWeight: "900",
  },

  appointmentType: {
    color: "#8e91a4",
    fontSize: 12,
    marginTop: 5,
  },

  appointmentDetails: {
    color: "#243a30",
    fontSize: 13,
    marginTop: 14,
  },

  appointmentNote: {
    color: "#9fa5b4",
    fontSize: 12,
    marginTop: 8,
  },

  confirmedBadge: {
    backgroundColor: "#e6fff2",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  confirmedText: {
    color: "#009060",
    fontSize: 10,
    fontWeight: "800",
  },

  pendingBadge: {
    backgroundColor: "#fff1e6",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  pendingText: {
    color: "#ff6b1a",
    fontSize: 10,
    fontWeight: "800",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  confirmButton: {
    flex: 1,
    height: 35,
    backgroundColor: "#e3f8ef",
    borderWidth: 1,
    borderColor: "#80d6b1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 8,
  },

  confirmButtonText: {
    color: "#009060",
    fontWeight: "800",
    marginLeft: 5,
  },

  cancelButton: {
    flex: 1,
    height: 35,
    backgroundColor: "#fff2f2",
    borderWidth: 1,
    borderColor: "#ffb6b6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  cancelButtonText: {
    color: "#e23b3b",
    fontWeight: "800",
    marginLeft: 5,
  },

  adminProfileHeader: {
    alignItems: "center",
    paddingTop: 25,
  },

  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#0f95bd",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  bigAvatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },

  cameraCircle: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1aaad0",
    borderWidth: 2,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  adminName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
  },

  adminSub: {
    color: "#5ff0b1",
    fontSize: 13,
    marginTop: 4,
  },

  fullAccessBadge: {
    marginTop: 10,
    backgroundColor: "#08784d",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  fullAccessText: {
    color: "#5ff0b1",
    fontSize: 11,
    fontWeight: "800",
  },

  colorDots: {
    flexDirection: "row",
    marginTop: 18,
  },

  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginHorizontal: 4,
  },

  colorDotActive: {
    borderWidth: 3,
    borderColor: "#ffffff",
  },

  profileContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  profileStatsCard: {
    marginTop: -34,
    height: 68,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  profileStat: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e7eee9",
  },

  profileStatValue: {
    color: "#009060",
    fontSize: 15,
    fontWeight: "900",
  },

  profileStatLabel: {
    color: "#9b8ead",
    fontSize: 10,
    marginTop: 6,
  },

  profileSectionTitle: {
    color: "#002c1d",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
  },

  infoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 13,
    overflow: "hidden",
    marginBottom: 18,
  },

  profileRowInfo: {
    height: 43,
    borderBottomWidth: 1,
    borderBottomColor: "#e7eee9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  profileRowLabel: {
    color: "#9b8ead",
    fontSize: 12,
  },

  profileRowValue: {
    color: "#002c1d",
    fontSize: 13,
    fontWeight: "800",
  },

  appearanceCard: {
    height: 58,
    backgroundColor: "#ffffff",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 14,
  },

  appearanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  darkModeTitle: {
    color: "#002c1d",
    fontWeight: "900",
    fontSize: 13,
  },

  darkModeSub: {
    color: "#9b8ead",
    fontSize: 11,
    marginTop: 3,
  },

  togglePill: {
    width: 45,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9df2c9",
    justifyContent: "center",
    alignItems: "center",
  },

  profileUploadButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e6fff2",
    borderWidth: 1,
    borderColor: "#80d6b1",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  profileUploadText: {
    color: "#009060",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  profileSignOut: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff8ef",
    borderWidth: 1,
    borderColor: "#efb4a2",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  profileSignOutText: {
    color: "#e23b3b",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  bottomNav: {
    height: 64,
    backgroundColor: "#003d25",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  bottomTab: {
    alignItems: "center",
    flex: 1,
  },

  bottomIconWrap: {
    position: "relative",
  },

  bottomBadge: {
    position: "absolute",
    top: -7,
    right: -10,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#ff6b1a",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },

  bottomTabText: {
    color: "#50906e",
    fontSize: 10,
    marginTop: 4,
  },

  bottomTabActiveText: {
    color: "#37e6a3",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "800",
  },
});