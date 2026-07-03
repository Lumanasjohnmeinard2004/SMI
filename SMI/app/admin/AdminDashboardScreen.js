// app/admin/AdminDashboardScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 900;
  const [activeTab, setActiveTab] = useState(params.tab || "overview");

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  function renderContent() {
    if (activeTab === "overview") return <OverviewContent isDesktopWeb={isDesktopWeb} />;
    if (activeTab === "members") return <MembersContent isDesktopWeb={isDesktopWeb} />;
    if (activeTab === "requests") return <RequestsContent isDesktopWeb={isDesktopWeb} />;
    if (activeTab === "profile") return <ProfileContent router={router} />;
    return <OverviewContent isDesktopWeb={isDesktopWeb} />;
  }

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.shell,
          isDesktopWeb
            ? [styles.shellDesktop, { minHeight: Math.max(height, 720) }]
            : styles.shellMobile,
        ]}
      >
        {isDesktopWeb && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            router={router}
          />
        )}

        <View style={styles.mainArea}>
          <TopHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            router={router}
            isDesktopWeb={isDesktopWeb}
          />

          <ScrollView
            style={styles.content}
            contentContainerStyle={[
              styles.contentInner,
              isDesktopWeb && styles.contentInnerDesktop,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>

          {!isDesktopWeb && (
            <BottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              router={router}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Sidebar({ activeTab, setActiveTab, router }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <View style={styles.brandIcon}>
          <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
        </View>

        <View>
          <Text style={styles.brandTitle}>SMI Coop</Text>
          <Text style={styles.brandSub}>Admin Portal</Text>
        </View>
      </View>

      <View style={styles.sidebarMenu}>
        <SidebarItem
          icon="bar-chart-2"
          label="Dashboard"
          active={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />

        <SidebarItem
          icon="users"
          label="Members"
          active={activeTab === "members"}
          onPress={() => setActiveTab("members")}
        />

        <SidebarItem
          icon="upload-cloud"
          label="Upload Records"
          active={false}
          onPress={() => router.push("/admin/AdminUploadCSVScreen")}
        />

        <SidebarItem
          icon="clipboard"
          label="Loan Requests"
          active={activeTab === "requests"}
          badge="1"
          onPress={() => setActiveTab("requests")}
        />

        <SidebarItem
          icon="user"
          label="Profile"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
      </View>

      <TouchableOpacity style={styles.sidebarLogout} onPress={() => router.push("/")}>
        <Feather name="log-out" size={18} color="#fecaca" />
        <Text style={styles.sidebarLogoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function SidebarItem({ icon, label, active, badge, onPress }) {
  return (
    <TouchableOpacity
      style={active ? styles.sidebarItemActive : styles.sidebarItem}
      onPress={onPress}
    >
      <Feather name={icon} size={18} color={active ? "#ffffff" : "#a7f3d0"} />

      <Text style={active ? styles.sidebarItemTextActive : styles.sidebarItemText}>
        {label}
      </Text>

      {badge && (
        <View style={styles.sidebarBadge}>
          <Text style={styles.sidebarBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function TopHeader({ activeTab, setActiveTab, router, isDesktopWeb }) {
  const titles = {
    overview: "Cooperative Dashboard",
    members: "Member Records",
    requests: "Loan Requests",
    profile: "Admin Profile",
  };

  const subtitles = {
    overview: "Overview of members, savings, loans, and dividends",
    members: "View and manage cooperative member records",
    requests: "Review and process member loan requests",
    profile: "System administrator account details",
  };

  return (
    <View style={styles.topHeader}>
      <View style={styles.topTitleBlock}>
        <View style={styles.portalRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#16a34a" />
          <Text style={styles.portalText}>ADMIN PORTAL</Text>
        </View>

        <Text style={styles.topTitle}>{titles[activeTab]}</Text>
        <Text style={styles.topSubtitle}>{subtitles[activeTab]}</Text>
      </View>

      <View style={styles.headerActions}>
        {!isDesktopWeb && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab("overview")}
          >
            <Feather name="home" size={18} color="#06472f" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.uploadHeaderButton}
          onPress={() => router.push("/admin/AdminUploadCSVScreen")}
        >
          <Feather name="upload-cloud" size={18} color="#ffffff" />
          {isDesktopWeb && <Text style={styles.uploadHeaderText}>Upload Records</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OverviewContent({ isDesktopWeb }) {
  return (
    <View>
      <View style={isDesktopWeb ? styles.statsGridDesktop : styles.statsGridMobile}>
        <StatCard
          icon="users"
          value="6"
          label="Total Members"
          sub="5 active members"
          color="#009060"
        />

        <StatCard
          icon="piggy-bank-outline"
          value="₱283k"
          label="Total Savings"
          sub="Savings and share capital"
          type="material"
          color="#0f766e"
        />

        <StatCard
          icon="credit-card"
          value="₱369k"
          label="Total Loans"
          sub="Outstanding balances"
          color="#ea580c"
        />

        <StatCard
          icon="trending-up"
          value="₱33k"
          label="Dividends Paid"
          sub="FY 2024"
          color="#16a34a"
        />
      </View>

      <View style={isDesktopWeb ? styles.overviewTwoColumns : null}>
        <View style={[styles.panelCard, isDesktopWeb && styles.panelCardFlex]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionTitle}>Savings vs Loans</Text>
              <Text style={styles.sectionSub}>Per member comparison</Text>
            </View>

            <View style={styles.legendRow}>
              <Legend color="#009060" label="Savings" />
              <Legend color="#ff7a1a" label="Loans" />
            </View>
          </View>

          <View style={styles.chartArea}>
            <MiniBar name="Maria" savings={90} loans={120} />
            <MiniBar name="Juan" savings={65} loans={95} />
            <MiniBar name="Lourdes" savings={120} loans={20} />
            <MiniBar name="Roberto" savings={45} loans={80} />
            <MiniBar name="Cristina" savings={135} loans={130} />
            <MiniBar name="Danilo" savings={35} loans={60} />
          </View>
        </View>

        <View style={[styles.panelCard, isDesktopWeb && styles.sidePanel]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ActivityItem title="Juan submitted a loan request" time="Today, 2:00 PM" />
          <ActivityItem title="Maria request approved" time="Mar 20, 2025" />
          <ActivityItem title="CSV upload ready for processing" time="Mar 19, 2025" />
          <ActivityItem title="Cristina record updated" time="Mar 18, 2025" />
        </View>
      </View>

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>All Members</Text>
            <Text style={styles.sectionSub}>Quick view of cooperative members</Text>
          </View>
        </View>

        {isDesktopWeb ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.4 }]}>Member</Text>
              <Text style={styles.th}>Member ID</Text>
              <Text style={styles.th}>Savings</Text>
              <Text style={styles.th}>Loan</Text>
              <Text style={styles.th}>Status</Text>
            </View>

            <MemberTableRow
              name="Maria Santos"
              username="@msantos"
              id="2019-004827"
              savings="₱52,750.00"
              loan="₱84,000.00"
              status="Caution"
            />

            <MemberTableRow
              name="Juan dela Cruz"
              username="@jdelacruz"
              id="2020-005112"
              savings="₱38,400.00"
              loan="₱60,000.00"
              status="Caution"
            />

            <MemberTableRow
              name="Lourdes Reyes"
              username="@lreyes"
              id="2018-003991"
              savings="₱71,200.00"
              loan="₱0.00"
              status="Excellent"
            />
          </View>
        ) : (
          <>
            <MemberCard
              name="Maria Santos"
              username="@msantos"
              id="2019-004827"
              savings="₱52,750.00"
              loan="₱84,000.00"
              dividend="₱6,330.00"
              status="Caution"
            />

            <MemberCard
              name="Juan dela Cruz"
              username="@jdelacruz"
              id="2020-005112"
              savings="₱38,400.00"
              loan="₱60,000.00"
              dividend="₱4,608.00"
              status="Caution"
            />

            <MemberCard
              name="Lourdes Reyes"
              username="@lreyes"
              id="2018-003991"
              savings="₱71,200.00"
              loan="₱0.00"
              dividend="₱8,544.00"
              status="Excellent"
            />
          </>
        )}
      </View>
    </View>
  );
}

function MembersContent({ isDesktopWeb }) {
  const members = [
    {
      name: "Maria Santos",
      username: "@msantos",
      id: "2019-004827",
      savings: "₱52,750.00",
      loan: "₱84,000.00",
      dividend: "₱6,330.00",
      status: "Caution",
    },
    {
      name: "Juan dela Cruz",
      username: "@jdelacruz",
      id: "2020-005112",
      savings: "₱38,400.00",
      loan: "₱60,000.00",
      dividend: "₱4,608.00",
      status: "Caution",
    },
    {
      name: "Lourdes Reyes",
      username: "@lreyes",
      id: "2018-003991",
      savings: "₱71,200.00",
      loan: "₱0.00",
      dividend: "₱8,544.00",
      status: "Excellent",
    },
    {
      name: "Roberto Alcantara",
      username: "@ralcantara",
      id: "2021-006033",
      savings: "₱18,600.00",
      loan: "₱30,000.00",
      dividend: "₱2,232.00",
      status: "Suspended",
    },
    {
      name: "Cristina Villanueva",
      username: "@cvillanueva",
      id: "2017-002748",
      savings: "₱94,300.00",
      loan: "₱120,000.00",
      dividend: "₱11,316.00",
      status: "Fair",
    },
  ];

  return (
    <View>
      <View style={styles.searchPanel}>
        <View style={styles.searchBox}>
          <Feather name="search" size={17} color="#64748b" />
          <Text style={styles.searchText}>Search by name, ID, or username...</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Member List</Text>
            <Text style={styles.sectionSub}>6 registered members</Text>
          </View>
        </View>

        {isDesktopWeb ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.4 }]}>Member</Text>
              <Text style={styles.th}>Member ID</Text>
              <Text style={styles.th}>Savings</Text>
              <Text style={styles.th}>Loan</Text>
              <Text style={styles.th}>Dividend</Text>
              <Text style={styles.th}>Status</Text>
              <Text style={styles.th}>Action</Text>
            </View>

            {members.map((member) => (
              <MemberFullTableRow key={member.id} {...member} />
            ))}
          </View>
        ) : (
          members.map((member) => <MemberCard key={member.id} {...member} />)
        )}
      </View>
    </View>
  );
}

function RequestsContent({ isDesktopWeb }) {
  const [selectedLoanType, setSelectedLoanType] = useState("All Loan Types");
  const [statusFilter, setStatusFilter] = useState("All");

  const requests = [
    {
      name: "Maria Santos",
      loanType: "Regular Loan",
      amount: "₱25,000.00",
      date: "Mar 20, 2025 · 10:00 AM",
      purpose: "Business expansion",
      status: "Approved",
    },
    {
      name: "Juan dela Cruz",
      loanType: "Educational Loan",
      amount: "₱15,000.00",
      date: "Mar 18, 2025 · 2:00 PM",
      purpose: "Tuition payment",
      status: "Pending",
      showActions: true,
    },
  ];

  return (
    <View>
      <View style={styles.filterPanel}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Loan Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["All Loan Types", "Regular Loan", "Educational Loan", "Medical Loan", "Vehicle Loan"].map(
              (item) => (
                <FilterChip
                  key={item}
                  label={item}
                  active={selectedLoanType === item}
                  onPress={() => setSelectedLoanType(item)}
                />
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["All", "Pending", "Approved", "Rejected"].map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={statusFilter === item}
                onPress={() => setStatusFilter(item)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Request Queue</Text>
            <Text style={styles.sectionSub}>1 pending · 2 total requests</Text>
          </View>
        </View>

        {isDesktopWeb ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.3 }]}>Member</Text>
              <Text style={styles.th}>Loan Type</Text>
              <Text style={styles.th}>Amount</Text>
              <Text style={styles.th}>Purpose</Text>
              <Text style={styles.th}>Status</Text>
              <Text style={styles.th}>Action</Text>
            </View>

            {requests.map((request) => (
              <RequestTableRow key={`${request.name}-${request.loanType}`} {...request} />
            ))}
          </View>
        ) : (
          requests.map((request) => (
            <RequestCard key={`${request.name}-${request.loanType}`} {...request} />
          ))
        )}
      </View>
    </View>
  );
}

function ProfileContent({ router }) {
  return (
    <View>
      <View style={styles.profileGrid}>
        <View style={styles.profileMainCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>A</Text>
          </View>

          <Text style={styles.profileName}>Administrator</Text>
          <Text style={styles.profileSub}>SMI Coop · System Admin</Text>

          <View style={styles.fullAccessBadge}>
            <Text style={styles.fullAccessText}>Full Access</Text>
          </View>
        </View>

        <View style={styles.profileInfoCard}>
          <Text style={styles.sectionTitle}>Account Info</Text>

          <ProfileRow label="Username" value="admin" />
          <ProfileRow label="Role" value="System Administrator" />
          <ProfileRow label="Access Level" value="Full — All Modules" />
          <ProfileRow
            label="Cooperative"
            value="Savings Mutual Inter-Company Multipurpose Cooperative"
          />
          <ProfileRow label="Last Login" value="Today" />

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
      </View>
    </View>
  );
}

function StatCard({ icon, value, label, sub, type, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}18` }]}>
        {type === "material" ? (
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        ) : (
          <Feather name={icon} size={22} color={color} />
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

function Legend({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function ActivityItem({ title, time }) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

function MemberTableRow({ name, username, id, savings, loan, status }) {
  return (
    <View style={styles.tableRow}>
      <View style={[styles.memberCell, { flex: 1.4 }]}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{name[0]}</Text>
        </View>
        <View>
          <Text style={styles.tableName}>{name}</Text>
          <Text style={styles.tableSub}>{username}</Text>
        </View>
      </View>

      <Text style={styles.td}>{id}</Text>
      <Text style={styles.tdGreen}>{savings}</Text>
      <Text style={styles.tdOrange}>{loan}</Text>
      <StatusBadge status={status} />
    </View>
  );
}

function MemberFullTableRow({ name, username, id, savings, loan, dividend, status }) {
  return (
    <View style={styles.tableRow}>
      <View style={[styles.memberCell, { flex: 1.4 }]}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{name[0]}</Text>
        </View>
        <View>
          <Text style={styles.tableName}>{name}</Text>
          <Text style={styles.tableSub}>{username}</Text>
        </View>
      </View>

      <Text style={styles.td}>{id}</Text>
      <Text style={styles.tdGreen}>{savings}</Text>
      <Text style={styles.tdOrange}>{loan}</Text>
      <Text style={styles.tdGreen}>{dividend}</Text>
      <StatusBadge status={status} />

      <TouchableOpacity style={styles.smallActionButton}>
        <Text style={styles.smallActionText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

function MemberCard({ name, username, id, savings, loan, dividend, status }) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberCardHeader}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{name[0]}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.memberCardName}>{name}</Text>
          <Text style={styles.memberCardMeta}>
            {username} · {id}
          </Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <View style={styles.memberStats}>
        <RecordStat label="Savings" value={savings} color="#009060" />
        <RecordStat label="Loan" value={loan} color="#ea580c" />
        <RecordStat label="Div" value={dividend} color="#009060" />
      </View>
    </View>
  );
}

function RequestTableRow({ name, loanType, amount, purpose, status, showActions }) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tdStrong, { flex: 1.3 }]}>{name}</Text>
      <Text style={styles.td}>{loanType}</Text>
      <Text style={styles.tdGreen}>{amount}</Text>
      <Text style={styles.td}>{purpose}</Text>
      <StatusBadge status={status} />

      <View style={styles.actionCell}>
        {showActions ? (
          <>
            <TouchableOpacity style={styles.approveMini}>
              <Feather name="check" size={14} color="#009060" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectMini}>
              <Feather name="x" size={14} color="#dc2626" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.tableSub}>Done</Text>
        )}
      </View>
    </View>
  );
}

function RequestCard({ name, loanType, amount, date, purpose, status, showActions }) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestCardHeader}>
        <View>
          <Text style={styles.requestName}>{name}</Text>
          <Text style={styles.requestLoanType}>{loanType}</Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <InfoBlock label="Amount Requested" value={amount} highlight />
      <InfoBlock label="Date Requested" value={date} />
      <InfoBlock label="Purpose" value={purpose} />

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

function InfoBlock({ label, value, highlight }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={highlight ? styles.infoValueHighlight : styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const statusStyle =
    status === "Excellent" || status === "Approved"
      ? styles.statusGreen
      : status === "Suspended" || status === "Rejected"
      ? styles.statusRed
      : styles.statusOrange;

  const textStyle =
    status === "Excellent" || status === "Approved"
      ? styles.statusGreenText
      : status === "Suspended" || status === "Rejected"
      ? styles.statusRedText
      : styles.statusOrangeText;

  return (
    <View style={statusStyle}>
      <Text style={textStyle}>{status}</Text>
    </View>
  );
}

function RecordStat({ label, value, color }) {
  return (
    <View style={styles.recordStat}>
      <Text style={[styles.recordStatValue, { color }]}>{value}</Text>
      <Text style={styles.recordStatLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity style={active ? styles.filterChipActive : styles.filterChip} onPress={onPress}>
      <Text style={active ? styles.filterChipTextActive : styles.filterChipText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ProfileRow({ label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  );
}

function BottomNav({ activeTab, setActiveTab, router }) {
  return (
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e8f5ee",
  },

  shell: {
    flex: 1,
    backgroundColor: "#f6fbf8",
  },

  shellDesktop: {
    flexDirection: "row",
    width: "100%",
  },

  shellMobile: {
    width: "100%",
    height: "100%",
  },

  sidebar: {
    width: 280,
    backgroundColor: "#06472f",
    paddingHorizontal: 22,
    paddingVertical: 24,
  },

  sidebarBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#009060",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  brandTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },

  brandSub: {
    color: "#a7f3d0",
    fontSize: 12,
    marginTop: 3,
  },

  sidebarMenu: {
    flex: 1,
  },

  sidebarItem: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  sidebarItemActive: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#009060",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  sidebarItemText: {
    flex: 1,
    color: "#a7f3d0",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 12,
  },

  sidebarItemTextActive: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 12,
  },

  sidebarBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff7a1a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  sidebarBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },

  sidebarLogout: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sidebarLogoutText: {
    color: "#fecaca",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  mainArea: {
    flex: 1,
    backgroundColor: "#f6fbf8",
  },

  topHeader: {
    minHeight: 112,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#d9eee6",
    paddingHorizontal: Platform.OS === "web" ? 32 : 18,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topTitleBlock: {
    flex: 1,
  },

  portalRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  portalText: {
    color: "#16a34a",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 5,
  },

  topTitle: {
    color: "#052e1d",
    fontSize: Platform.OS === "web" ? 28 : 21,
    fontWeight: "900",
    marginTop: 6,
  },

  topSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 5,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  uploadHeaderButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: "#009060",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadHeaderText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  content: {
    flex: 1,
  },

  contentInner: {
    padding: 18,
    paddingBottom: 92,
  },

  contentInnerDesktop: {
    padding: 32,
    paddingBottom: 40,
  },

  statsGridDesktop: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 20,
  },

  statsGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: Platform.OS === "web" ? 0 : 12,
    borderWidth: 1,
    borderColor: "#e2f2eb",
  },

  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  statValue: {
    color: "#052e1d",
    fontSize: 26,
    fontWeight: "900",
  },

  statLabel: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },

  statSub: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },

  overviewTwoColumns: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },

  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    marginBottom: 18,
  },

  panelCardFlex: {
    flex: 1,
  },

  sidePanel: {
    width: 360,
  },

  panelHeader: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#052e1d",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSub: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },

  chartArea: {
    height: 190,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eef6f1",
    paddingTop: 18,
  },

  miniBarWrap: {
    alignItems: "center",
    flex: 1,
  },

  barSlot: {
    height: 145,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  savingsBar: {
    width: 12,
    backgroundColor: "#009060",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginRight: 4,
  },

  loansBar: {
    width: 12,
    backgroundColor: "#ff7a1a",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  barName: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 8,
  },

  legendRow: {
    flexDirection: "row",
    marginTop: Platform.OS === "web" ? 0 : 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },

  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 6,
  },

  legendText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },

  activityItem: {
    flexDirection: "row",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eef6f1",
  },

  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#009060",
    marginTop: 5,
    marginRight: 10,
  },

  activityTitle: {
    color: "#052e1d",
    fontSize: 14,
    fontWeight: "800",
  },

  activityTime: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },

  table: {
    borderWidth: 1,
    borderColor: "#e2f2eb",
    borderRadius: 14,
    overflow: "hidden",
  },

  tableHeader: {
    minHeight: 48,
    backgroundColor: "#f0fbf6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  th: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    fontWeight: "900",
  },

  tableRow: {
    minHeight: 64,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2f2eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  memberCell: {
    flexDirection: "row",
    alignItems: "center",
  },

  initialCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fff1e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  initialText: {
    color: "#ea580c",
    fontSize: 15,
    fontWeight: "900",
  },

  tableName: {
    color: "#052e1d",
    fontSize: 14,
    fontWeight: "900",
  },

  tableSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 3,
  },

  td: {
    flex: 1,
    color: "#334155",
    fontSize: 13,
  },

  tdStrong: {
    flex: 1,
    color: "#052e1d",
    fontSize: 13,
    fontWeight: "900",
  },

  tdGreen: {
    flex: 1,
    color: "#009060",
    fontSize: 13,
    fontWeight: "900",
  },

  tdOrange: {
    flex: 1,
    color: "#ea580c",
    fontSize: 13,
    fontWeight: "900",
  },

  searchPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    marginBottom: 18,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
  },

  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#f0fbf6",
    borderWidth: 1,
    borderColor: "#cfeee0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchText: {
    color: "#64748b",
    fontSize: 13,
    marginLeft: 9,
  },

  addButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: "#009060",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Platform.OS === "web" ? 12 : 0,
    marginTop: Platform.OS === "web" ? 0 : 12,
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 7,
  },

  statusGreen: {
    flex: 1,
    maxWidth: 100,
    backgroundColor: "#e6fff2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  statusGreenText: {
    color: "#009060",
    fontSize: 11,
    fontWeight: "900",
  },

  statusOrange: {
    flex: 1,
    maxWidth: 100,
    backgroundColor: "#fff1e6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  statusOrangeText: {
    color: "#ea580c",
    fontSize: 11,
    fontWeight: "900",
  },

  statusRed: {
    flex: 1,
    maxWidth: 100,
    backgroundColor: "#fee2e2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  statusRedText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "900",
  },

  smallActionButton: {
    flex: 1,
    maxWidth: 80,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
  },

  smallActionText: {
    color: "#009060",
    fontSize: 12,
    fontWeight: "900",
  },

  memberCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    marginBottom: 12,
    overflow: "hidden",
  },

  memberCardHeader: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  memberCardName: {
    color: "#052e1d",
    fontSize: 15,
    fontWeight: "900",
  },

  memberCardMeta: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
  },

  memberStats: {
    minHeight: 54,
    borderTopWidth: 1,
    borderTopColor: "#e2f2eb",
    flexDirection: "row",
  },

  recordStat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  recordStatValue: {
    fontSize: 12,
    fontWeight: "900",
  },

  recordStatLabel: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 4,
  },

  filterPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    marginBottom: 18,
  },

  filterGroup: {
    marginBottom: 12,
  },

  filterLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 9,
  },

  filterChip: {
    height: 36,
    borderRadius: 999,
    backgroundColor: "#f0fbf6",
    borderWidth: 1,
    borderColor: "#cfeee0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filterChipActive: {
    height: 36,
    borderRadius: 999,
    backgroundColor: "#009060",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filterChipText: {
    color: "#06472f",
    fontSize: 12,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  actionCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  approveMini: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  rejectMini: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },

  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    padding: 16,
    marginBottom: 12,
  },

  requestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  requestName: {
    color: "#052e1d",
    fontSize: 15,
    fontWeight: "900",
  },

  requestLoanType: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },

  infoBlock: {
    marginBottom: 12,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  infoValue: {
    color: "#334155",
    fontSize: 13,
  },

  infoValueHighlight: {
    color: "#009060",
    fontSize: 17,
    fontWeight: "900",
  },

  requestActionRow: {
    flexDirection: "row",
    marginTop: 4,
  },

  approveButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e6fff2",
    borderWidth: 1,
    borderColor: "#86efac",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 10,
  },

  approveButtonText: {
    color: "#009060",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  rejectButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fff7f7",
    borderWidth: 1,
    borderColor: "#fecaca",
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

  profileGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 20,
  },

  profileMainCard: {
    width: Platform.OS === "web" ? 320 : "100%",
    backgroundColor: "#06472f",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 18,
  },

  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#009060",
    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
  },

  profileName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
  },

  profileSub: {
    color: "#a7f3d0",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  fullAccessBadge: {
    marginTop: 14,
    backgroundColor: "#08784d",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  fullAccessText: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "900",
  },

  profileInfoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2f2eb",
  },

  profileRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#eef6f1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileRowLabel: {
    flex: 1,
    color: "#64748b",
    fontSize: 13,
  },

  profileRowValue: {
    flex: 1.4,
    color: "#052e1d",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  profileUploadButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#e6fff2",
    borderWidth: 1,
    borderColor: "#86efac",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 18,
  },

  profileUploadText: {
    color: "#009060",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  profileSignOut: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#fff7f7",
    borderWidth: 1,
    borderColor: "#fecaca",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
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