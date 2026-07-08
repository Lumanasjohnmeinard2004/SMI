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
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import SmiLogo from "../../components/SmiLogo";
import { apiRequest } from "../../config/api";

const GOLD = "#c89b2c";
const DARK_GREEN = "#06472f";
const MAIN_GREEN = "#009060";
const LIGHT_GREEN = "#e6fff2";
const PAGE_BG = "#f6fbf8";

function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return `₱${numberValue.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTotalSavings(member) {
  return (
    Number(member.savings || 0) +
    Number(member.share_capital || 0) +
    Number(member.special_savings || 0)
  );
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

function getSmartBarHeight(value, maxValue, maxHeight) {
  const numericValue = Number(value || 0);

  if (numericValue <= 0 || maxValue <= 0) {
    return 0;
  }

  const scaled = Math.sqrt(numericValue / maxValue) * maxHeight;

  return Math.max(8, scaled);
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const words = String(name).trim().split(" ").filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function mapDbMember(member) {
  const rawSavings = getTotalSavings(member);
  const rawLoan = getTotalLoan(member);
  const rawDividend = Number(member.dividend_amount || 0);

  return {
    dbId: member.id,
    name: member.full_name,
    username: `@${member.username}`,
    rawUsername: member.username,
    id: member.member_id,
    status: member.status || "Active",

    share_capital: Number(member.share_capital || 0),
    savings_value: Number(member.savings || 0),
    special_savings: Number(member.special_savings || 0),

    regular_loan: Number(member.regular_loan || 0),
    regular_loan_diminishing: Number(member.regular_loan_diminishing || 0),
    educational_loan: Number(member.educational_loan || 0),
    educational_loan_diminishing: Number(member.educational_loan_diminishing || 0),
    short_term_loan: Number(member.short_term_loan || 0),
    short_term_loan_diminishing: Number(member.short_term_loan_diminishing || 0),
    appliance_loan: Number(member.appliance_loan || 0),
    appliance_loan_diminishing: Number(member.appliance_loan_diminishing || 0),
    medical_loan: Number(member.medical_loan || 0),
    medical_loan_diminishing: Number(member.medical_loan_diminishing || 0),
    petty_cash_loan: Number(member.petty_cash_loan || 0),
    vehicle_loan: Number(member.vehicle_loan || 0),
    inter_trading_loan: Number(member.inter_trading_loan || 0),

    regular_loan_due_date: formatDate(member.regular_loan_due_date),
    regular_loan_diminishing_due_date: formatDate(member.regular_loan_diminishing_due_date),
    educational_loan_due_date: formatDate(member.educational_loan_due_date),
    educational_loan_diminishing_due_date: formatDate(member.educational_loan_diminishing_due_date),
    short_term_loan_due_date: formatDate(member.short_term_loan_due_date),
    short_term_loan_diminishing_due_date: formatDate(member.short_term_loan_diminishing_due_date),
    appliance_loan_due_date: formatDate(member.appliance_loan_due_date),
    appliance_loan_diminishing_due_date: formatDate(member.appliance_loan_diminishing_due_date),
    medical_loan_due_date: formatDate(member.medical_loan_due_date),
    medical_loan_diminishing_due_date: formatDate(member.medical_loan_diminishing_due_date),
    petty_cash_loan_due_date: formatDate(member.petty_cash_loan_due_date),
    vehicle_loan_due_date: formatDate(member.vehicle_loan_due_date),
    inter_trading_loan_due_date: formatDate(member.inter_trading_loan_due_date),

    rawSavings,
    rawLoan,
    rawDividend,
    savings: formatCurrency(rawSavings),
    loan: formatCurrency(rawLoan),
    dividend: formatCurrency(rawDividend),
  };
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 900;

  const [activeTab, setActiveTab] = useState(params.tab || "overview");
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  useEffect(() => {
    loadMembersFromDatabase();
  }, []);

  async function loadMembersFromDatabase() {
    try {
      setMembersLoading(true);
      setMembersError("");

      const data = await apiRequest("/members", "GET");
      const mappedMembers = (data.members || []).map(mapDbMember);

      setMembers(mappedMembers);
    } catch (error) {
      setMembersError(error.message || "Failed to load members.");
    } finally {
      setMembersLoading(false);
    }
  }

  function addMemberToList(member) {
    setMembers((prev) => [mapDbMember(member), ...prev]);
  }

  function renderContent() {
    if (activeTab === "overview") {
      return (
        <OverviewContent
          members={members}
          membersLoading={membersLoading}
          membersError={membersError}
          onRefresh={loadMembersFromDatabase}
          isDesktopWeb={isDesktopWeb}
        />
      );
    }

    if (activeTab === "members") {
      return (
        <MembersContent
          members={members}
          isDesktopWeb={isDesktopWeb}
          onMemberAdded={addMemberToList}
          membersLoading={membersLoading}
          membersError={membersError}
          onRefresh={loadMembersFromDatabase}
        />
      );
    }

    if (activeTab === "requests") {
      return <RequestsContent isDesktopWeb={isDesktopWeb} />;
    }

    if (activeTab === "profile") {
      return <ProfileContent router={router} />;
    }

    return null;
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
        <View style={styles.logoBox}>
          <SmiLogo size={48} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>SMI Coop</Text>
          <Text style={styles.brandSub}>Admin Portal</Text>
        </View>
      </View>

      <View style={styles.sidebarDivider} />

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
          badge="!"
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
      <Feather name={icon} size={19} color={active ? "#ffffff" : "#d8c07a"} />

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
    members: "View, add, and manage cooperative member records",
    requests: "Review and process member loan requests",
    profile: "System administrator account details",
  };

  return (
    <View style={styles.topHeader}>
      {!isDesktopWeb && (
        <View style={styles.mobileLogoWrap}>
          <SmiLogo size={42} />
        </View>
      )}

      <View style={styles.topTitleBlock}>
        <View style={styles.portalRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={GOLD} />
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
            <Feather name="home" size={18} color={DARK_GREEN} />
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

function OverviewContent({
  members,
  membersLoading,
  membersError,
  onRefresh,
  isDesktopWeb,
}) {
  const [showFullGraph, setShowFullGraph] = useState(false);

  const totalSavings = members.reduce((sum, member) => {
    return sum + Number(member.rawSavings || 0);
  }, 0);

  const totalLoans = members.reduce((sum, member) => {
    return sum + Number(member.rawLoan || 0);
  }, 0);

  const totalDividends = members.reduce((sum, member) => {
    return sum + Number(member.rawDividend || 0);
  }, 0);

  return (
    <View>
      <View style={isDesktopWeb ? styles.statsGridDesktop : styles.statsGridMobile}>
        <StatCard
          icon="users"
          value={membersLoading ? "..." : String(members.length)}
          label="Total Members"
          sub="From database"
          color={MAIN_GREEN}
        />

        <StatCard
          icon="piggy-bank-outline"
          value={formatCurrency(totalSavings)}
          label="Total Savings"
          sub="Savings + share capital"
          type="material"
          color={GOLD}
        />

        <StatCard
          icon="credit-card"
          value={formatCurrency(totalLoans)}
          label="Total Loans"
          sub="Outstanding balances"
          color={GOLD}
        />

        <StatCard
          icon="trending-up"
          value={formatCurrency(totalDividends)}
          label="Dividends Paid"
          sub="Dividend amount"
          color={MAIN_GREEN}
        />
      </View>

      {membersError ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={16} color="#991b1b" />
          <Text style={styles.errorText}>{membersError}</Text>
        </View>
      ) : null}

      <MinimalMemberChart
        members={members}
        loading={membersLoading}
        onRefresh={onRefresh}
        onOpenFullGraph={() => setShowFullGraph(true)}
      />

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>All Members</Text>
            <Text style={styles.sectionSub}>Quick view from database</Text>
          </View>
        </View>

        {members.length === 0 && !membersLoading ? (
          <Text style={styles.emptyText}>No members found in the database.</Text>
        ) : isDesktopWeb ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.4 }]}>Member</Text>
              <Text style={styles.th}>Member ID</Text>
              <Text style={styles.th}>Savings</Text>
              <Text style={styles.th}>Loan</Text>
              <Text style={styles.th}>Status</Text>
            </View>

            {members.slice(0, 5).map((member) => (
              <MemberTableRow key={`${member.id}-${member.username}`} {...member} />
            ))}
          </View>
        ) : (
          members.slice(0, 5).map((member) => (
            <MemberCard key={`${member.id}-${member.username}`} {...member} />
          ))
        )}
      </View>

      <FullGraphModal
        visible={showFullGraph}
        members={members}
        onClose={() => setShowFullGraph(false)}
      />
    </View>
  );
}

function MinimalMemberChart({ members, loading, onRefresh, onOpenFullGraph }) {
  const previewMembers = members.slice(0, 8);

  const maxValue = Math.max(
    1,
    ...previewMembers.map((member) =>
      Math.max(Number(member.rawSavings || 0), Number(member.rawLoan || 0))
    )
  );

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartTopRow}>
        <View>
          <Text style={styles.sectionTitle}>Member Balance Overview</Text>
          <Text style={styles.sectionSub}>Smart-scaled view of savings and loans</Text>
        </View>

        <View style={styles.chartActions}>
          <TouchableOpacity style={styles.fullGraphButton} onPress={onOpenFullGraph}>
            <Text style={styles.fullGraphText}>View Full Graph</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chartRefreshButton} onPress={onRefresh}>
            <Feather name="refresh-cw" size={15} color={MAIN_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.miniLegendRow}>
        <View style={styles.legendItem}>
          <View style={styles.legendSavings} />
          <Text style={styles.legendText}>Savings</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.legendLoans} />
          <Text style={styles.legendText}>Loan</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.chartLoadingBox}>
          <ActivityIndicator color={MAIN_GREEN} />
          <Text style={styles.noticeText}>Loading chart...</Text>
        </View>
      ) : previewMembers.length === 0 ? (
        <Text style={styles.emptyText}>No graph data available.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.minimalChartArea}>
            {previewMembers.map((member) => {
              const savingsHeight = getSmartBarHeight(
                member.rawSavings,
                maxValue,
                118
              );

              const loanHeight = getSmartBarHeight(
                member.rawLoan,
                maxValue,
                118
              );

              return (
                <View key={`${member.id}-mini-chart`} style={styles.minimalColumn}>
                  <View style={styles.minimalBarsWrap}>
                    <View
                      style={[
                        styles.minimalSavingsBar,
                        {
                          height: savingsHeight,
                        },
                      ]}
                    />

                    <View
                      style={[
                        styles.minimalLoanBar,
                        {
                          height: loanHeight,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.minimalChartLabel} numberOfLines={1}>
                    {getInitials(member.name)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <Text style={styles.graphNote}>
        Smaller balances are enlarged visually so they remain visible beside very large accounts.
      </Text>
    </View>
  );
}

function FullGraphModal({ visible, members, onClose }) {
  const maxValue = Math.max(
    1,
    ...members.map((member) =>
      Math.max(Number(member.rawSavings || 0), Number(member.rawLoan || 0))
    )
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.fullGraphModal}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Full Member Graph</Text>
              <Text style={styles.modalSubtitle}>
                Savings and loan totals based on database records
              </Text>
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          <View style={styles.fullGraphLegend}>
            <View style={styles.legendItem}>
              <View style={styles.legendSavings} />
              <Text style={styles.legendText}>Total Savings</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendLoans} />
              <Text style={styles.legendText}>Total Loan</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.fullGraphScrollContent}>
              {members.length === 0 ? (
                <Text style={styles.emptyText}>No graph data available.</Text>
              ) : (
                members.map((member) => {
                  const savingsHeight = getSmartBarHeight(
                    member.rawSavings,
                    maxValue,
                    220
                  );

                  const loanHeight = getSmartBarHeight(
                    member.rawLoan,
                    maxValue,
                    220
                  );

                  return (
                    <View key={`${member.id}-full-chart`} style={styles.fullGraphColumn}>
                      <View style={styles.fullGraphBarsWrap}>
                        <View
                          style={[
                            styles.fullGraphSavingsBar,
                            {
                              height: savingsHeight,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.fullGraphLoanBar,
                            {
                              height: loanHeight,
                            },
                          ]}
                        />
                      </View>

                      <Text style={styles.fullGraphName} numberOfLines={1}>
                        {member.name}
                      </Text>

                      <Text style={styles.fullGraphId}>{member.id}</Text>

                      <View style={styles.fullGraphValues}>
                        <Text style={styles.fullGraphSavingsText}>
                          S: {formatCurrency(member.rawSavings)}
                        </Text>

                        <Text style={styles.fullGraphLoanText}>
                          L: {formatCurrency(member.rawLoan)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          <Text style={styles.graphNote}>
            This is a balance comparison graph. Smaller balances are scaled visually so they remain visible beside very large accounts.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function MembersContent({
  members,
  isDesktopWeb,
  onMemberAdded,
  membersLoading,
  membersError,
  onRefresh,
}) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filteredMembers = members.filter((member) => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(member.name || "").toLowerCase().includes(search) ||
      String(member.id || "").toLowerCase().includes(search) ||
      String(member.username || "").toLowerCase().includes(search)
    );
  });

  return (
    <View>
      <View style={styles.searchPanel}>
        <View style={styles.searchBox}>
          <Feather name="search" size={17} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by name, ID, or username..."
            placeholderTextColor="#64748b"
          />
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Feather name="refresh-cw" size={17} color={MAIN_GREEN} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddMember(true)}
        >
          <Feather name="plus" size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      {membersLoading && (
        <View style={styles.noticeBox}>
          <ActivityIndicator color={MAIN_GREEN} />
          <Text style={styles.noticeText}>Loading members from database...</Text>
        </View>
      )}

      {membersError ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={16} color="#991b1b" />
          <Text style={styles.errorText}>{membersError}</Text>
        </View>
      ) : null}

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Member List</Text>
            <Text style={styles.sectionSub}>
              {filteredMembers.length} registered members
            </Text>
          </View>
        </View>

        {filteredMembers.length === 0 && !membersLoading ? (
          <Text style={styles.emptyText}>No members found in the database.</Text>
        ) : isDesktopWeb ? (
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

            {filteredMembers.map((member) => (
              <MemberFullTableRow
                key={`${member.id}-${member.username}`}
                member={member}
                onView={() => setSelectedMember(member)}
              />
            ))}
          </View>
        ) : (
          filteredMembers.map((member) => (
            <MemberCard
              key={`${member.id}-${member.username}`}
              {...member}
              onView={() => setSelectedMember(member)}
            />
          ))
        )}
      </View>

      <AddMemberModal
        visible={showAddMember}
        onClose={() => setShowAddMember(false)}
        onMemberAdded={onMemberAdded}
      />

      <EditMemberModal
        visible={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSaved={async () => {
          setSelectedMember(null);
          await onRefresh();
        }}
      />
    </View>
  );
}

function AddMemberModal({ visible, onClose, onMemberAdded }) {
  const [form, setForm] = useState({
    member_id: "",
    full_name: "",
    username: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveMember() {
    try {
      setMessage("");
      setIsError(false);

      if (
        !form.member_id.trim() ||
        !form.full_name.trim() ||
        !form.username.trim() ||
        !form.password.trim()
      ) {
        setIsError(true);
        setMessage("Please complete all required fields.");
        return;
      }

      setSaving(true);

      const data = await apiRequest("/members", "POST", {
        member_id: form.member_id.trim(),
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
      });

      onMemberAdded(data.member);

      setForm({
        member_id: "",
        full_name: "",
        username: "",
        password: "",
      });

      setIsError(false);
      setMessage("Member saved successfully.");

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 700);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to save member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.addMemberModal}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <Text style={styles.modalSubtitle}>
                Create a member account and save it to the database
              </Text>
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          {message ? (
            <View style={isError ? styles.errorBox : styles.successBox}>
              <Feather
                name={isError ? "alert-circle" : "check-circle"}
                size={16}
                color={isError ? "#991b1b" : "#047857"}
              />
              <Text style={isError ? styles.errorText : styles.successText}>
                {message}
              </Text>
            </View>
          ) : null}

          <ModalInput
            label="Member ID"
            value={form.member_id}
            onChangeText={(value) => updateField("member_id", value)}
            placeholder="e.g. SMI-002"
          />

          <ModalInput
            label="Full Name"
            value={form.full_name}
            onChangeText={(value) => updateField("full_name", value)}
            placeholder="e.g. Pedro Reyes"
          />

          <ModalInput
            label="Username"
            value={form.username}
            onChangeText={(value) => updateField("username", value)}
            placeholder="e.g. preyes"
            autoCapitalize="none"
          />

          <ModalInput
            label="Temporary Password"
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
            placeholder="e.g. member123"
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelMemberButton} onPress={onClose}>
              <Text style={styles.cancelMemberText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveMemberButton}
              onPress={saveMember}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Feather name="save" size={17} color="#ffffff" />
                  <Text style={styles.saveMemberText}>Save Member</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EditMemberModal({ visible, member, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        full_name: member.name || "",
        member_id: member.id || "",
        username: member.rawUsername || "",
        status: member.status || "Active",

        share_capital: String(member.share_capital || ""),
        savings: String(member.savings_value || ""),
        special_savings: String(member.special_savings || ""),
        dividend_amount: String(member.rawDividend || ""),

        regular_loan: String(member.regular_loan || ""),
        regular_loan_diminishing: String(member.regular_loan_diminishing || ""),
        educational_loan: String(member.educational_loan || ""),
        educational_loan_diminishing: String(member.educational_loan_diminishing || ""),
        short_term_loan: String(member.short_term_loan || ""),
        short_term_loan_diminishing: String(member.short_term_loan_diminishing || ""),
        appliance_loan: String(member.appliance_loan || ""),
        appliance_loan_diminishing: String(member.appliance_loan_diminishing || ""),
        medical_loan: String(member.medical_loan || ""),
        medical_loan_diminishing: String(member.medical_loan_diminishing || ""),
        petty_cash_loan: String(member.petty_cash_loan || ""),
        vehicle_loan: String(member.vehicle_loan || ""),
        inter_trading_loan: String(member.inter_trading_loan || ""),

        regular_loan_due_date: member.regular_loan_due_date || "",
        regular_loan_diminishing_due_date: member.regular_loan_diminishing_due_date || "",
        educational_loan_due_date: member.educational_loan_due_date || "",
        educational_loan_diminishing_due_date: member.educational_loan_diminishing_due_date || "",
        short_term_loan_due_date: member.short_term_loan_due_date || "",
        short_term_loan_diminishing_due_date: member.short_term_loan_diminishing_due_date || "",
        appliance_loan_due_date: member.appliance_loan_due_date || "",
        appliance_loan_diminishing_due_date: member.appliance_loan_diminishing_due_date || "",
        medical_loan_due_date: member.medical_loan_due_date || "",
        medical_loan_diminishing_due_date: member.medical_loan_diminishing_due_date || "",
        petty_cash_loan_due_date: member.petty_cash_loan_due_date || "",
        vehicle_loan_due_date: member.vehicle_loan_due_date || "",
        inter_trading_loan_due_date: member.inter_trading_loan_due_date || "",
      });

      setMessage("");
      setIsError(false);
    }
  }, [member]);

  if (!member) {
    return null;
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setMessage("");
      setIsError(false);

      if (!form.full_name.trim() || !form.member_id.trim() || !form.username.trim()) {
        setIsError(true);
        setMessage("Full name, member ID, and username are required.");
        return;
      }

      await apiRequest(`/members/${member.dbId}/financials`, "PATCH", {
        full_name: form.full_name.trim(),
        member_id: form.member_id.trim(),
        username: form.username.trim(),
        status: form.status.trim() || "Active",

        share_capital: form.share_capital,
        savings: form.savings,
        special_savings: form.special_savings,
        dividend_amount: form.dividend_amount,

        regular_loan: form.regular_loan,
        regular_loan_diminishing: form.regular_loan_diminishing,
        educational_loan: form.educational_loan,
        educational_loan_diminishing: form.educational_loan_diminishing,
        short_term_loan: form.short_term_loan,
        short_term_loan_diminishing: form.short_term_loan_diminishing,
        appliance_loan: form.appliance_loan,
        appliance_loan_diminishing: form.appliance_loan_diminishing,
        medical_loan: form.medical_loan,
        medical_loan_diminishing: form.medical_loan_diminishing,
        petty_cash_loan: form.petty_cash_loan,
        vehicle_loan: form.vehicle_loan,
        inter_trading_loan: form.inter_trading_loan,

        regular_loan_due_date: form.regular_loan_due_date,
        regular_loan_diminishing_due_date: form.regular_loan_diminishing_due_date,
        educational_loan_due_date: form.educational_loan_due_date,
        educational_loan_diminishing_due_date: form.educational_loan_diminishing_due_date,
        short_term_loan_due_date: form.short_term_loan_due_date,
        short_term_loan_diminishing_due_date: form.short_term_loan_diminishing_due_date,
        appliance_loan_due_date: form.appliance_loan_due_date,
        appliance_loan_diminishing_due_date: form.appliance_loan_diminishing_due_date,
        medical_loan_due_date: form.medical_loan_due_date,
        medical_loan_diminishing_due_date: form.medical_loan_diminishing_due_date,
        petty_cash_loan_due_date: form.petty_cash_loan_due_date,
        vehicle_loan_due_date: form.vehicle_loan_due_date,
        inter_trading_loan_due_date: form.inter_trading_loan_due_date,
      });

      setIsError(false);
      setMessage("Member record updated successfully.");

      setTimeout(() => {
        onSaved();
      }, 500);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to update member record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.editMemberModal}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Edit Member Record</Text>
              <Text style={styles.modalSubtitle}>
                Update account details, savings, loans, dividends, and due dates
              </Text>
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          {message ? (
            <View style={isError ? styles.errorBox : styles.successBox}>
              <Feather
                name={isError ? "alert-circle" : "check-circle"}
                size={16}
                color={isError ? "#991b1b" : "#047857"}
              />
              <Text style={isError ? styles.errorText : styles.successText}>
                {message}
              </Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.editSectionTitle}>Member Information</Text>

            <View style={styles.modalGrid}>
              <ModalInput
                label="Full Name"
                value={form.full_name}
                onChangeText={(value) => updateField("full_name", value)}
                placeholder="Full name"
              />

              <ModalInput
                label="Member ID"
                value={form.member_id}
                onChangeText={(value) => updateField("member_id", value)}
                placeholder="SMI-001"
              />

              <ModalInput
                label="Username"
                value={form.username}
                onChangeText={(value) => updateField("username", value)}
                placeholder="username"
                autoCapitalize="none"
              />

              <ModalInput
                label="Status"
                value={form.status}
                onChangeText={(value) => updateField("status", value)}
                placeholder="Active"
              />
            </View>

            <Text style={styles.editSectionTitle}>Savings and Dividend</Text>

            <View style={styles.modalGrid}>
              <ModalInput label="Share Capital" value={form.share_capital} onChangeText={(value) => updateField("share_capital", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Savings" value={form.savings} onChangeText={(value) => updateField("savings", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Special Savings" value={form.special_savings} onChangeText={(value) => updateField("special_savings", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Dividend Amount" value={form.dividend_amount} onChangeText={(value) => updateField("dividend_amount", value)} placeholder="0.00" keyboardType="numeric" />
            </View>

            <Text style={styles.editSectionTitle}>Loan Balances</Text>

            <View style={styles.modalGrid}>
              <ModalInput label="Regular Loan" value={form.regular_loan} onChangeText={(value) => updateField("regular_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Regular Loan - Diminishing" value={form.regular_loan_diminishing} onChangeText={(value) => updateField("regular_loan_diminishing", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Educational Loan" value={form.educational_loan} onChangeText={(value) => updateField("educational_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Educational Loan - Diminishing" value={form.educational_loan_diminishing} onChangeText={(value) => updateField("educational_loan_diminishing", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Short-term Loan" value={form.short_term_loan} onChangeText={(value) => updateField("short_term_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Short-term Loan - Diminishing" value={form.short_term_loan_diminishing} onChangeText={(value) => updateField("short_term_loan_diminishing", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Appliance Loan" value={form.appliance_loan} onChangeText={(value) => updateField("appliance_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Appliance Loan - Diminishing" value={form.appliance_loan_diminishing} onChangeText={(value) => updateField("appliance_loan_diminishing", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Medical Loan" value={form.medical_loan} onChangeText={(value) => updateField("medical_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Medical Loan - Diminishing" value={form.medical_loan_diminishing} onChangeText={(value) => updateField("medical_loan_diminishing", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Petty Cash Loan" value={form.petty_cash_loan} onChangeText={(value) => updateField("petty_cash_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Vehicle Loan" value={form.vehicle_loan} onChangeText={(value) => updateField("vehicle_loan", value)} placeholder="0.00" keyboardType="numeric" />
              <ModalInput label="Inter-Trading Loan" value={form.inter_trading_loan} onChangeText={(value) => updateField("inter_trading_loan", value)} placeholder="0.00" keyboardType="numeric" />
            </View>

            <Text style={styles.editSectionTitle}>Loan Due Dates</Text>

            <View style={styles.modalGrid}>
              <ModalInput label="Regular Loan Due Date" value={form.regular_loan_due_date} onChangeText={(value) => updateField("regular_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Regular Diminishing Due Date" value={form.regular_loan_diminishing_due_date} onChangeText={(value) => updateField("regular_loan_diminishing_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Educational Loan Due Date" value={form.educational_loan_due_date} onChangeText={(value) => updateField("educational_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Educational Diminishing Due Date" value={form.educational_loan_diminishing_due_date} onChangeText={(value) => updateField("educational_loan_diminishing_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Short-term Loan Due Date" value={form.short_term_loan_due_date} onChangeText={(value) => updateField("short_term_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Short-term Diminishing Due Date" value={form.short_term_loan_diminishing_due_date} onChangeText={(value) => updateField("short_term_loan_diminishing_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Appliance Loan Due Date" value={form.appliance_loan_due_date} onChangeText={(value) => updateField("appliance_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Appliance Diminishing Due Date" value={form.appliance_loan_diminishing_due_date} onChangeText={(value) => updateField("appliance_loan_diminishing_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Medical Loan Due Date" value={form.medical_loan_due_date} onChangeText={(value) => updateField("medical_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Medical Diminishing Due Date" value={form.medical_loan_diminishing_due_date} onChangeText={(value) => updateField("medical_loan_diminishing_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Petty Cash Due Date" value={form.petty_cash_loan_due_date} onChangeText={(value) => updateField("petty_cash_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Vehicle Loan Due Date" value={form.vehicle_loan_due_date} onChangeText={(value) => updateField("vehicle_loan_due_date", value)} placeholder="YYYY-MM-DD" />
              <ModalInput label="Inter-Trading Due Date" value={form.inter_trading_loan_due_date} onChangeText={(value) => updateField("inter_trading_loan_due_date", value)} placeholder="YYYY-MM-DD" />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelMemberButton} onPress={onClose}>
              <Text style={styles.cancelMemberText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveMemberButton}
              onPress={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Feather name="save" size={17} color="#ffffff" />
                  <Text style={styles.saveMemberText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ModalInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "words",
  keyboardType = "default",
}) {
  return (
    <View style={styles.modalInputGroup}>
      <Text style={styles.modalInputLabel}>{label}</Text>

      <TextInput
        style={styles.modalInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function RequestsContent({ isDesktopWeb }) {
  const [selectedLoanType, setSelectedLoanType] = useState("All Loan Types");
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    loadLoanRequests();
  }, []);

  async function loadLoanRequests() {
    try {
      setRequestsLoading(true);
      setRequestsError("");

      const data = await apiRequest("/requests", "GET");

      setRequests(data.requests || []);
    } catch (error) {
      setRequestsError(error.message || "Failed to load loan requests.");
    } finally {
      setRequestsLoading(false);
    }
  }

  const loanTypeOptions = [
    "All Loan Types",
    "Regular Loan",
    "Educational Loan",
    "Medical Loan",
    "Vehicle Loan",
  ];

  const statusOptions = ["All", "Pending", "Approved", "Rejected"];

  const filteredRequests = requests.filter((request) => {
    const matchesLoanType =
      selectedLoanType === "All Loan Types" ||
      request.loan_type === selectedLoanType;

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesLoanType && matchesStatus;
  });

  return (
    <View>
      <View style={styles.filterPanel}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Loan Type</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loanTypeOptions.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={selectedLoanType === item}
                onPress={() => setSelectedLoanType(item)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((item) => (
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

      {requestsLoading && (
        <View style={styles.noticeBox}>
          <ActivityIndicator color={MAIN_GREEN} />
          <Text style={styles.noticeText}>Loading loan requests...</Text>
        </View>
      )}

      {requestsError ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={16} color="#991b1b" />
          <Text style={styles.errorText}>{requestsError}</Text>
        </View>
      ) : null}

      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Request Queue</Text>
            <Text style={styles.sectionSub}>{filteredRequests.length} total requests</Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={loadLoanRequests}>
            <Feather name="refresh-cw" size={17} color={MAIN_GREEN} />
          </TouchableOpacity>
        </View>

        {filteredRequests.length === 0 && !requestsLoading ? (
          <Text style={styles.emptyText}>No loan requests found.</Text>
        ) : isDesktopWeb ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.3 }]}>Member</Text>
              <Text style={styles.th}>Loan Type</Text>
              <Text style={styles.th}>Amount</Text>
              <Text style={styles.th}>Purpose</Text>
              <Text style={styles.th}>Status</Text>
            </View>

            {filteredRequests.map((request) => (
              <RequestTableRow key={request.id} request={request} />
            ))}
          </View>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
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
          <View style={styles.profileLogoCircle}>
            <SmiLogo size={92} />
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
            <Feather name="upload-cloud" size={18} color={MAIN_GREEN} />
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
      <View style={[styles.statIconBox, { backgroundColor: `${color}1A` }]}>
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

function MemberTableRow({ name, username, id, savings, loan, status }) {
  return (
    <View style={styles.tableRow}>
      <View style={[styles.memberCell, { flex: 1.4 }]}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{name ? name[0] : "?"}</Text>
        </View>

        <View>
          <Text style={styles.tableName}>{name}</Text>
          <Text style={styles.tableSub}>{username}</Text>
        </View>
      </View>

      <Text style={styles.td}>{id}</Text>
      <Text style={styles.tdGreen}>{savings}</Text>
      <Text style={styles.tdGold}>{loan}</Text>
      <StatusBadge status={status} />
    </View>
  );
}

function MemberFullTableRow({ member, onView }) {
  return (
    <View style={styles.tableRow}>
      <View style={[styles.memberCell, { flex: 1.4 }]}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{member.name ? member.name[0] : "?"}</Text>
        </View>

        <View>
          <Text style={styles.tableName}>{member.name}</Text>
          <Text style={styles.tableSub}>{member.username}</Text>
        </View>
      </View>

      <Text style={styles.td}>{member.id}</Text>
      <Text style={styles.tdGreen}>{member.savings}</Text>
      <Text style={styles.tdGold}>{member.loan}</Text>
      <Text style={styles.tdGreen}>{member.dividend}</Text>
      <StatusBadge status={member.status} />

      <TouchableOpacity style={styles.smallActionButton} onPress={onView}>
        <Text style={styles.smallActionText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

function MemberCard({
  name,
  username,
  id,
  savings,
  loan,
  dividend,
  status,
  onView,
}) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberCardHeader}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{name ? name[0] : "?"}</Text>
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
        <RecordStat label="Savings" value={savings} color={MAIN_GREEN} />
        <RecordStat label="Loan" value={loan} color={GOLD} />
        <RecordStat label="Div" value={dividend} color={MAIN_GREEN} />
      </View>

      <TouchableOpacity style={styles.mobileViewButton} onPress={onView}>
        <Text style={styles.mobileViewText}>View and Edit Member</Text>
      </TouchableOpacity>
    </View>
  );
}

function RequestTableRow({ request }) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tdStrong, { flex: 1.3 }]}>{request.full_name}</Text>
      <Text style={styles.td}>{request.loan_type}</Text>
      <Text style={styles.tdGreen}>{formatCurrency(request.amount)}</Text>
      <Text style={styles.td}>{request.purpose}</Text>
      <StatusBadge status={request.status} />
    </View>
  );
}

function RequestCard({ request }) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestCardHeader}>
        <View>
          <Text style={styles.requestName}>{request.full_name}</Text>
          <Text style={styles.requestLoanType}>{request.loan_type}</Text>
        </View>

        <StatusBadge status={request.status} />
      </View>

      <InfoBlock label="Amount Requested" value={formatCurrency(request.amount)} highlight />
      <InfoBlock label="Purpose" value={request.purpose} />

      {request.admin_remarks ? (
        <InfoBlock label="Admin Remarks" value={request.admin_remarks} />
      ) : null}
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
  const good = status === "Excellent" || status === "Approved" || status === "Active";
  const bad = status === "Suspended" || status === "Rejected";

  return (
    <View style={good ? styles.statusGreen : bad ? styles.statusRed : styles.statusGold}>
      <Text
        style={
          good
            ? styles.statusGreenText
            : bad
            ? styles.statusRedText
            : styles.statusGoldText
        }
      >
        {status}
      </Text>
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
    <TouchableOpacity
      style={active ? styles.filterChipActive : styles.filterChip}
      onPress={onPress}
    >
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
        badge="!"
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
        <Feather name={icon} size={20} color={active ? GOLD : "#50906e"} />

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
    backgroundColor: PAGE_BG,
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
    width: 286,
    backgroundColor: DARK_GREEN,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRightWidth: 3,
    borderRightColor: GOLD,
  },

  sidebarBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: GOLD,
    overflow: "hidden",
  },

  brandTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },

  brandSub: {
    color: "#d8c07a",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  sidebarDivider: {
    height: 1,
    backgroundColor: "rgba(200, 155, 44, 0.35)",
    marginBottom: 22,
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
    backgroundColor: MAIN_GREEN,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  sidebarItemText: {
    flex: 1,
    color: "#d8c07a",
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
    backgroundColor: GOLD,
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
    backgroundColor: PAGE_BG,
  },

  topHeader: {
    minHeight: 112,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5d4a2",
    paddingHorizontal: Platform.OS === "web" ? 32 : 18,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mobileLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  topTitleBlock: {
    flex: 1,
  },

  portalRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  portalText: {
    color: GOLD,
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
    backgroundColor: "#fff8e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  uploadHeaderButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
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
    borderColor: "#efe2bd",
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

  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
  },

  chartTopRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    alignItems: Platform.OS === "web" ? "center" : "flex-start",
    marginBottom: 12,
  },

  chartActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "web" ? 0 : 12,
  },

  fullGraphButton: {
    height: 34,
    borderRadius: 999,
    backgroundColor: "#fffdf5",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 8,
  },

  fullGraphText: {
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  chartRefreshButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#86efac",
    justifyContent: "center",
    alignItems: "center",
  },

  miniLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  legendSavings: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: MAIN_GREEN,
    marginRight: 7,
  },

  legendLoans: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: GOLD,
    marginRight: 7,
  },

  legendText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
  },

  chartLoadingBox: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },

  minimalChartArea: {
    height: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 12,
    paddingHorizontal: 6,
  },

  minimalColumn: {
    width: 68,
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 12,
  },

  minimalBarsWrap: {
    height: 122,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  minimalSavingsBar: {
    width: 8,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: MAIN_GREEN,
    marginRight: 4,
  },

  minimalLoanBar: {
    width: 8,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: GOLD,
  },

  minimalChartLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 8,
  },

  graphNote: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    fontWeight: "700",
  },

  fullGraphModal: {
    width: Platform.OS === "web" ? "82%" : "100%",
    maxWidth: 980,
    maxHeight: "86%",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: GOLD,
  },

  fullGraphLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  fullGraphScrollContent: {
    minHeight: 360,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 12,
  },

  fullGraphColumn: {
    width: 120,
    alignItems: "center",
    marginRight: 16,
  },

  fullGraphBarsWrap: {
    height: 220,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  fullGraphSavingsBar: {
    width: 12,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: MAIN_GREEN,
    marginRight: 6,
  },

  fullGraphLoanBar: {
    width: 12,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: GOLD,
  },

  fullGraphName: {
    width: 110,
    color: "#052e1d",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },

  fullGraphId: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },

  fullGraphValues: {
    marginTop: 8,
    alignItems: "center",
  },

  fullGraphSavingsText: {
    color: MAIN_GREEN,
    fontSize: 10,
    fontWeight: "900",
  },

  fullGraphLoanText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },

  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
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

  table: {
    borderWidth: 1,
    borderColor: "#efe2bd",
    borderRadius: 14,
    overflow: "hidden",
  },

  tableHeader: {
    minHeight: 48,
    backgroundColor: "#fff8e1",
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
    borderTopColor: "#efe2bd",
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
    backgroundColor: "#fff8e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e5d4a2",
  },

  initialText: {
    color: GOLD,
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
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  tdGold: {
    flex: 1,
    color: GOLD,
    fontSize: 13,
    fontWeight: "900",
  },

  searchPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
  },

  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#fffdf5",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    color: "#052e1d",
    fontSize: 13,
    marginLeft: 9,
    height: "100%",
    outlineStyle: "none",
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#86efac",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Platform.OS === "web" ? 12 : 0,
    marginTop: Platform.OS === "web" ? 0 : 12,
  },

  addButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
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

  noticeBox: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#e6fff2",
    borderWidth: 1,
    borderColor: "#86efac",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  noticeText: {
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 10,
  },

  emptyText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 18,
    textAlign: "center",
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
    color: MAIN_GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  statusGold: {
    flex: 1,
    maxWidth: 100,
    backgroundColor: "#fff8e1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  statusGoldText: {
    color: GOLD,
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
    backgroundColor: LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
  },

  smallActionText: {
    color: MAIN_GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  mobileViewButton: {
    height: 42,
    borderTopWidth: 1,
    borderTopColor: "#efe2bd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fffb",
  },

  mobileViewText: {
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  memberCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#efe2bd",
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
    borderTopColor: "#efe2bd",
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
    borderColor: "#efe2bd",
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
    backgroundColor: "#fffdf5",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filterChipActive: {
    height: 36,
    borderRadius: 999,
    backgroundColor: MAIN_GREEN,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filterChipText: {
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#efe2bd",
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
    color: MAIN_GREEN,
    fontSize: 17,
    fontWeight: "900",
  },

  profileGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 20,
  },

  profileMainCard: {
    width: Platform.OS === "web" ? 320 : "100%",
    backgroundColor: DARK_GREEN,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 18,
    borderWidth: 2,
    borderColor: GOLD,
  },

  profileLogoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  profileName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
  },

  profileSub: {
    color: "#d8c07a",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  fullAccessBadge: {
    marginTop: 14,
    backgroundColor: "rgba(200, 155, 44, 0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GOLD,
  },

  fullAccessText: {
    color: "#f6dd8c",
    fontSize: 12,
    fontWeight: "900",
  },

  profileInfoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#efe2bd",
  },

  profileRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#f3ead0",
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
    color: MAIN_GREEN,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  addMemberModal: {
    width: Platform.OS === "web" ? 520 : "100%",
    maxWidth: 540,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: GOLD,
  },

  editMemberModal: {
    width: Platform.OS === "web" ? "82%" : "100%",
    maxWidth: 980,
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: GOLD,
  },

  editSectionTitle: {
    color: DARK_GREEN,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  modalGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    gap: Platform.OS === "web" ? 12 : 0,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    color: "#052e1d",
    fontSize: 23,
    fontWeight: "900",
  },

  modalSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 5,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },

  modalInputGroup: {
    flex: Platform.OS === "web" ? 1 : undefined,
    minWidth: Platform.OS === "web" ? 220 : "100%",
    marginBottom: 14,
  },

  modalInputLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },

  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d4a2",
    backgroundColor: "#fffdf5",
    paddingHorizontal: 14,
    color: "#052e1d",
    fontSize: 14,
    outlineStyle: "none",
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 12,
  },

  cancelMemberButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  cancelMemberText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "900",
  },

  saveMemberButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  saveMemberText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  errorBox: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },

  successBox: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  successText: {
    flex: 1,
    color: "#047857",
    fontSize: 13,
    fontWeight: "700",
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
    backgroundColor: GOLD,
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
    color: GOLD,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "800",
  },
});