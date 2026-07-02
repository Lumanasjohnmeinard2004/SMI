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

          {activeTab === "requests" && <RequestsHeader />}

          {activeTab === "profile" && <AdminProfileHeader />}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "members" && <MembersContent />}
          {activeTab === "requests" && <RequestsContent />}
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
            icon="clipboard"
            label="Reqs"
            active={activeTab === "requests"}
            badge="1"
            onPress={() => setActiveTab("requests")}
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

function RequestsHeader() {
  const [selectedLoanType, setSelectedLoanType] = useState("All Loan Types");
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const loanTypes = [
    "All Loan Types",
    "Regular Loan",
    "Regular Loan - Diminishing",
    "Educational Loan",
    "Educational Loan - Diminishing",
    "Short-term Loan",
    "Short-term Loan - Diminishing",
    "Appliance Loan",
    "Appliance Loan - Diminishing",
    "Medical Loan",
    "Medical Loan - Diminishing",
    "Petty Cash Loan",
    "Vehicle Loan",
    "Inter-Trading Loan",
  ];

  return (
    <>
      <Text style={styles.requestsTitle}>Requests</Text>
      <Text style={styles.requestsSub}>1 pending · 2 total</Text>

      <TouchableOpacity
        style={styles.loanDropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Feather name="credit-card" size={17} color="#37e6a3" />
        <Text style={styles.loanDropdownText}>{selectedLoanType}</Text>
        <Feather
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={19}
          color="#d9fff0"
        />
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.loanDropdownMenu}>
          <ScrollView style={styles.loanDropdownScroll} nestedScrollEnabled>
            {loanTypes.map((loanType) => (
              <TouchableOpacity
                key={loanType}
                style={
                  selectedLoanType === loanType
                    ? styles.loanDropdownItemActive
                    : styles.loanDropdownItem
                }
                onPress={() => {
                  setSelectedLoanType(loanType);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={
                    selectedLoanType === loanType
                      ? styles.loanDropdownItemTextActive
                      : styles.loanDropdownItemText
                  }
                >
                  {loanType}
                </Text>

                {selectedLoanType === loanType && (
                  <Ionicons name="checkmark-circle" size={16} color="#37e6a3" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.requestFilterRow}>
        <RequestFilterChip
          label="All"
          active={statusFilter === "All"}
          onPress={() => setStatusFilter("All")}
        />

        <RequestFilterChip
          label="Pending"
          active={statusFilter === "Pending"}
          onPress={() => setStatusFilter("Pending")}
        />

        <RequestFilterChip
          label="Approved"
          active={statusFilter === "Approved"}
          onPress={() => setStatusFilter("Approved")}
        />

        <RequestFilterChip
          label="Rejected"
          active={statusFilter === "Rejected"}
          onPress={() => setStatusFilter("Rejected")}
        />
      </View>
    </>
  );
}

function RequestsContent() {
  return (
    <View style={styles.requestsWrapper}>
      <RequestCard
        name="Maria Santos"
        loanType="Regular Loan"
        amount="₱25,000.00"
        date="Mar 20, 2025 · 10:00 AM"
        purpose="Business expansion"
        status="Approved"
      />

      <RequestCard
        name="Juan dela Cruz"
        loanType="Educational Loan"
        amount="₱15,000.00"
        date="Mar 18, 2025 · 2:00 PM"
        purpose="Tuition payment"
        status="Pending"
        showActions
      />
    </View>
  );
}

function RequestCard({
  name,
  loanType,
  amount,
  date,
  purpose,
  status,
  showActions,
}) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestCardHeader}>
        <View>
          <Text style={styles.requestName}>{name}</Text>
          <Text style={styles.requestLoanType}>{loanType}</Text>
        </View>

        <View
          style={
            status === "Approved"
              ? styles.approvedBadge
              : status === "Rejected"
              ? styles.rejectedBadge
              : styles.pendingRequestBadge
          }
        >
          <Text
            style={
              status === "Approved"
                ? styles.approvedText
                : status === "Rejected"
                ? styles.rejectedText
                : styles.pendingRequestText
            }
          >
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.requestInfoBlock}>
        <Text style={styles.requestLabel}>Amount Requested</Text>
        <Text style={styles.requestAmount}>{amount}</Text>
      </View>

      <View style={styles.requestInfoBlock}>
        <Text style={styles.requestLabel}>Date Requested</Text>
        <Text style={styles.requestValue}>{date}</Text>
      </View>

      <View style={styles.requestInfoBlock}>
        <Text style={styles.requestLabel}>Purpose</Text>
        <Text style={styles.requestValue}>{purpose}</Text>
      </View>

      {showActions && (
        <View style={styles.requestActionRow}>
          <TouchableOpacity style={styles.approveButton}>
            <Feather name="check-square" size={16} color="#009060" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton}>
            <Feather name="x-circle" size={16} color="#ff4b4b" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
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
        <ProfileRow label="Last Login" value="Today" />
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

function RequestFilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={active ? styles.requestFilterChipActive : styles.requestFilterChip}
      onPress={onPress}
    >
      <Text style={active ? styles.requestFilterChipActiveText : styles.requestFilterChipText}>
        {label}
      </Text>
    </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 16,
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

  requestsTitle: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 4,
  },

  requestsSub: {
    color: "#37e6a3",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 14,
  },

  loanDropdownButton: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1c8c62",
    backgroundColor: "#075b3c",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  loanDropdownText: {
    flex: 1,
    color: "#d9fff0",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 10,
  },

  loanDropdownMenu: {
    maxHeight: 190,
    borderRadius: 12,
    backgroundColor: "#075b3c",
    borderWidth: 1,
    borderColor: "#1c8c62",
    marginTop: 6,
    overflow: "hidden",
  },

  loanDropdownScroll: {
    maxHeight: 190,
  },

  loanDropdownItem: {
    height: 36,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loanDropdownItemActive: {
    height: 36,
    paddingHorizontal: 13,
    backgroundColor: "#0a704a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loanDropdownItemText: {
    color: "#d9fff0",
    fontSize: 12,
    fontWeight: "700",
  },

  loanDropdownItemTextActive: {
    color: "#37e6a3",
    fontSize: 12,
    fontWeight: "900",
  },

  requestFilterRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  requestFilterChip: {
    height: 32,
    minWidth: 62,
    borderRadius: 11,
    backgroundColor: "#0b6a47",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 12,
  },

  requestFilterChipActive: {
    height: 32,
    minWidth: 50,
    borderRadius: 11,
    backgroundColor: "#0c8559",
    borderWidth: 1,
    borderColor: "#24e4a0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 12,
  },

  requestFilterChipText: {
    color: "#b9e8d2",
    fontSize: 12,
    fontWeight: "900",
  },

  requestFilterChipActiveText: {
    color: "#37e6a3",
    fontSize: 12,
    fontWeight: "900",
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
    backgroundColor: "#e6fff2",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  excellentText: {
    color: "#009060",
    fontSize: 10,
    fontWeight: "800",
  },

  suspendedBadge: {
    backgroundColor: "#ffe9e9",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  suspendedText: {
    color: "#e23b3b",
    fontSize: 10,
    fontWeight: "800",
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

  requestsWrapper: {
    padding: 18,
    paddingBottom: 92,
  },

  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 14,
  },

  requestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  requestName: {
    color: "#002c1d",
    fontSize: 14,
    fontWeight: "900",
  },

  requestLoanType: {
    color: "#7f8790",
    fontSize: 12,
    marginTop: 4,
  },

  approvedBadge: {
    backgroundColor: "#e6fff2",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  approvedText: {
    color: "#009060",
    fontSize: 11,
    fontWeight: "900",
  },

  pendingRequestBadge: {
    backgroundColor: "#fff1dd",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  pendingRequestText: {
    color: "#ff9800",
    fontSize: 11,
    fontWeight: "900",
  },

  rejectedBadge: {
    backgroundColor: "#ffe9e9",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  rejectedText: {
    color: "#ff4b4b",
    fontSize: 11,
    fontWeight: "900",
  },

  requestInfoBlock: {
    marginBottom: 14,
  },

  requestLabel: {
    color: "#596c63",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  requestAmount: {
    color: "#009060",
    fontSize: 17,
    fontWeight: "900",
  },

  requestValue: {
    color: "#243a30",
    fontSize: 13,
    lineHeight: 18,
  },

  requestActionRow: {
    flexDirection: "row",
    marginTop: 4,
  },

  approveButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38d39f",
    backgroundColor: "#e8fff5",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 12,
  },

  approveButtonText: {
    color: "#009060",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  rejectButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff5f5f",
    backgroundColor: "#fff7f7",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  rejectButtonText: {
    color: "#ff4b4b",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  adminProfileHeader: {
    alignItems: "center",
    paddingTop: 10,
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