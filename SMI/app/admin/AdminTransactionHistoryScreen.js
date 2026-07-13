// app/admin/AdminTransactionHistoryScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getDirection(transaction) {
  const direction = String(transaction.direction || "").toLowerCase();
  const type = String(transaction.transaction_type || transaction.type || "").toLowerCase();

  if (direction === "credit" || direction === "in") {
    return "credit";
  }

  if (direction === "debit" || direction === "out") {
    return "debit";
  }

  if (
    type.includes("withdraw") ||
    type.includes("payment") ||
    type.includes("deduction") ||
    type.includes("charge") ||
    type.includes("payout")
  ) {
    return "debit";
  }

  return "credit";
}

function getStatusStyle(status) {
  const cleanStatus = String(status || "Completed").toLowerCase();

  if (
    cleanStatus === "completed" ||
    cleanStatus === "approved" ||
    cleanStatus === "paid"
  ) {
    return {
      backgroundColor: "#dcfce7",
      borderColor: "#86efac",
      color: "#166534",
    };
  }

  if (cleanStatus === "pending" || cleanStatus === "processing") {
    return {
      backgroundColor: "#fef3c7",
      borderColor: "#fcd34d",
      color: "#92400e",
    };
  }

  return {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
    color: "#991b1b",
  };
}

function normalizeTransaction(rawItem, index) {
  const type =
    rawItem.transaction_type ||
    rawItem.type ||
    rawItem.category ||
    rawItem.title ||
    "Transaction";

  const date =
    rawItem.created_at ||
    rawItem.transaction_date ||
    rawItem.date ||
    rawItem.updated_at ||
    rawItem.posted_at ||
    null;

  const amount = Number(rawItem.amount || rawItem.transaction_amount || rawItem.value || 0);

  const referenceNo =
    rawItem.reference_no ||
    rawItem.referenceNo ||
    rawItem.reference ||
    rawItem.or_number ||
    rawItem.receipt_no ||
    rawItem.transaction_code ||
    rawItem.id ||
    `TXN-${index + 1}`;

  return {
    id: String(rawItem.id || rawItem.transaction_id || referenceNo || index),
    transactionCode: String(rawItem.transaction_code || `TXN-${index + 1}`),
    referenceNo: String(referenceNo),

    memberDbId: rawItem.member_db_id || "",
    memberCode: rawItem.member_code || rawItem.member_id || "",
    username: rawItem.username || "",
    memberName: rawItem.member_name || rawItem.full_name || rawItem.name || "Unknown Member",

    type: String(type),
    amount,
    direction: getDirection(rawItem),
    status: String(rawItem.status || rawItem.transaction_status || "Completed"),
    date,

    source: String(rawItem.source || rawItem.channel || "System"),
    sourceId: rawItem.source_id || "",
    requestId: rawItem.request_id || "",

    balanceField: rawItem.balance_field || "",
    balanceBefore:
      rawItem.balance_before === null || rawItem.balance_before === undefined
        ? null
        : Number(rawItem.balance_before),
    balanceAfter:
      rawItem.balance_after === null || rawItem.balance_after === undefined
        ? null
        : Number(rawItem.balance_after),

    recordMonth: rawItem.record_month || "",
    remarks: String(rawItem.remarks || rawItem.notes || rawItem.description || "No remarks"),
  };
}

export default function AdminTransactionHistoryScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 900;

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest("/transactions", "GET");

      const rawTransactions =
        data.transactions ||
        data.records ||
        data.history ||
        data.data ||
        [];

      const cleanTransactions = Array.isArray(rawTransactions)
        ? rawTransactions.map((item, index) => normalizeTransaction(item, index))
        : [];

      cleanTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
          return 0;
        }

        if (Number.isNaN(dateA)) {
          return 1;
        }

        if (Number.isNaN(dateB)) {
          return -1;
        }

        return dateB - dateA;
      });

      setTransactions(cleanTransactions);
      setSummary(data.summary || null);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Failed to load admin transaction history. Please check your transaction API endpoint."
      );
    } finally {
      setLoading(false);
    }
  }

  async function importCurrentBalances() {
    try {
      setActionLoading(true);
      setErrorMessage("");

      await apiRequest("/transactions/import-current-balances", "POST", {});
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message || "Failed to import current balances.");
    } finally {
      setActionLoading(false);
    }
  }

  async function rebuildFromMonthlySnapshots() {
    try {
      setActionLoading(true);
      setErrorMessage("");

      await apiRequest("/transactions/rebuild-from-monthly", "POST", {});
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message || "Failed to rebuild transactions from monthly records.");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateTransactionStatus(id, status) {
    try {
      setActionLoading(true);
      setErrorMessage("");

      await apiRequest(`/transactions/${id}/status`, "PATCH", {
        status,
      });

      setSelectedTransaction(null);
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message || "Failed to update transaction status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteTransaction(id) {
    try {
      setActionLoading(true);
      setErrorMessage("");

      await apiRequest(`/transactions/${id}`, "DELETE");

      setSelectedTransaction(null);
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete transaction.");
    } finally {
      setActionLoading(false);
    }
  }

  const transactionTypes = useMemo(() => {
    const uniqueTypes = transactions.map((item) => item.type).filter(Boolean);
    return ["All", ...Array.from(new Set(uniqueTypes))];
  }, [transactions]);

  const transactionMonths = useMemo(() => {
    const uniqueMonths = transactions
      .map((item) => item.recordMonth)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(uniqueMonths))];
  }, [transactions]);

  const statusOptions = ["All", "Completed", "Pending", "Approved", "Rejected", "Failed"];

  const filteredTransactions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesType = selectedType === "All" || item.type === selectedType;
      const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
      const matchesMonth = selectedMonth === "All" || item.recordMonth === selectedMonth;

      const searchableText = [
        item.transactionCode,
        item.referenceNo,
        item.memberName,
        item.memberCode,
        item.username,
        item.type,
        item.status,
        item.source,
        item.balanceField,
        item.remarks,
        item.recordMonth,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = keyword.length === 0 || searchableText.includes(keyword);

      return matchesType && matchesStatus && matchesMonth && matchesSearch;
    });
  }, [transactions, selectedType, selectedStatus, selectedMonth, searchText]);

  const totalIn = useMemo(() => {
    return filteredTransactions
      .filter((item) => item.direction === "credit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredTransactions]);

  const totalOut = useMemo(() => {
    return filteredTransactions
      .filter((item) => item.direction === "debit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredTransactions]);

  const completedCount = filteredTransactions.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status === "completed" || status === "approved" || status === "paid";
  }).length;

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
        {isDesktopWeb && <Sidebar router={router} />}

        <View style={styles.mainArea}>
          <TopHeader router={router} isDesktopWeb={isDesktopWeb} />

          <ScrollView
            style={styles.content}
            contentContainerStyle={[
              styles.contentInner,
              isDesktopWeb && styles.contentInnerDesktop,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color="#991b1b" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={isDesktopWeb ? styles.statsGridDesktop : styles.statsGridMobile}>
              <StatCard
                icon="list"
                value={loading ? "..." : String(filteredTransactions.length)}
                label="Shown Records"
                sub={`${transactions.length} total records`}
                color={MAIN_GREEN}
              />

              <StatCard
                icon="arrow-down-left"
                value={formatCurrency(totalIn)}
                label="Total In"
                sub="Credit transactions"
                color={MAIN_GREEN}
              />

              <StatCard
                icon="arrow-up-right"
                value={formatCurrency(totalOut)}
                label="Total Out"
                sub="Debit transactions"
                color="#dc2626"
              />

              <StatCard
                icon="check-circle"
                value={String(completedCount)}
                label="Completed"
                sub="Completed or approved"
                color={GOLD}
              />
            </View>

            <View style={styles.actionPanel}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Admin Transaction Tools</Text>
                <Text style={styles.sectionSub}>
                  Import starting balances or rebuild history from monthly records.
                </Text>
              </View>

              <View style={styles.actionButtonRow}>
                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={importCurrentBalances}
                  disabled={actionLoading}
                >
                  <Feather name="download-cloud" size={16} color={MAIN_GREEN} />
                  <Text style={styles.secondaryActionText}>Import Current Balances</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={rebuildFromMonthlySnapshots}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Feather name="refresh-cw" size={16} color="#ffffff" />
                      <Text style={styles.primaryActionText}>Rebuild From Monthly</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterPanel}>
              <View style={styles.searchBox}>
                <Feather name="search" size={17} color="#64748b" />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search member, ID, reference, type, remarks..."
                  placeholderTextColor="#64748b"
                />
              </View>

              <FilterSection
                label="Transaction Type"
                options={transactionTypes}
                selected={selectedType}
                onSelect={setSelectedType}
              />

              <FilterSection
                label="Status"
                options={statusOptions}
                selected={selectedStatus}
                onSelect={setSelectedStatus}
              />

              <FilterSection
                label="Record Month"
                options={transactionMonths}
                selected={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </View>

            <View style={styles.panelCard}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Transaction History</Text>
                  <Text style={styles.sectionSub}>
                    All member transaction records across the cooperative
                  </Text>
                </View>

                <TouchableOpacity style={styles.refreshButton} onPress={loadTransactions}>
                  <Feather name="refresh-cw" size={17} color={MAIN_GREEN} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={MAIN_GREEN} />
                  <Text style={styles.loadingText}>Loading transactions...</Text>
                </View>
              ) : filteredTransactions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons
                    name="file-search-outline"
                    size={38}
                    color="#64748b"
                  />
                  <Text style={styles.emptyTitle}>No transactions found</Text>
                  <Text style={styles.emptyText}>
                    Try changing your search or selected filters.
                  </Text>
                </View>
              ) : isDesktopWeb ? (
                <TransactionTable
                  transactions={filteredTransactions}
                  onView={setSelectedTransaction}
                />
              ) : (
                filteredTransactions.map((item) => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                    onPress={() => setSelectedTransaction(item)}
                  />
                ))
              )}
            </View>
          </ScrollView>

          {!isDesktopWeb && <BottomNav router={router} />}
        </View>
      </View>

      <TransactionDetailsModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        loading={actionLoading}
        onClose={() => setSelectedTransaction(null)}
        onComplete={() => updateTransactionStatus(selectedTransaction?.id, "Completed")}
        onPending={() => updateTransactionStatus(selectedTransaction?.id, "Pending")}
        onDelete={() => deleteTransaction(selectedTransaction?.id)}
      />
    </View>
  );
}

function Sidebar({ router }) {
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
          active={false}
          onPress={() => router.push("/admin/AdminDashboardScreen")}
        />

        <SidebarItem
          icon="users"
          label="Members"
          active={false}
          onPress={() =>
            router.push({
              pathname: "/admin/AdminDashboardScreen",
              params: { tab: "members" },
            })
          }
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
          active={false}
          badge="!"
          onPress={() =>
            router.push({
              pathname: "/admin/AdminDashboardScreen",
              params: { tab: "requests" },
            })
          }
        />

        <SidebarItem
          icon="clock"
          label="Transaction History"
          active
          onPress={() => {}}
        />

        <SidebarItem
          icon="user"
          label="Profile"
          active={false}
          onPress={() =>
            router.push({
              pathname: "/admin/AdminDashboardScreen",
              params: { tab: "profile" },
            })
          }
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

function TopHeader({ router, isDesktopWeb }) {
  return (
    <View style={styles.topHeader}>
      {!isDesktopWeb && (
        <View style={styles.mobileLogoWrap}>
          <SmiLogo size={42} />
        </View>
      )}

      <View style={styles.topTitleBlock}>
        <View style={styles.portalRow}>
          <Ionicons name="time-outline" size={14} color={GOLD} />
          <Text style={styles.portalText}>ADMIN PORTAL</Text>
        </View>

        <Text style={styles.topTitle}>Transaction History</Text>
        <Text style={styles.topSubtitle}>
          View all recorded member transactions, balances, and activity logs
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/admin/AdminDashboardScreen")}
      >
        <Feather name="arrow-left" size={18} color={DARK_GREEN} />
        {isDesktopWeb && <Text style={styles.backButtonText}>Back to Dashboard</Text>}
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ icon, value, label, sub, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}1A` }]}>
        <Feather name={icon} size={22} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function FilterSection({ label, options, selected, onSelect }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((item) => (
          <TouchableOpacity
            key={item}
            style={selected === item ? styles.filterChipActive : styles.filterChip}
            onPress={() => onSelect(item)}
          >
            <Text
              style={
                selected === item
                  ? styles.filterChipTextActive
                  : styles.filterChipText
              }
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function TransactionTable({ transactions, onView }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1.35 }]}>Member</Text>
        <Text style={[styles.th, { flex: 1.2 }]}>Type</Text>
        <Text style={styles.th}>Amount</Text>
        <Text style={styles.th}>Direction</Text>
        <Text style={styles.th}>Month</Text>
        <Text style={styles.th}>Status</Text>
        <Text style={styles.th}>Action</Text>
      </View>

      {transactions.map((item) => (
        <TransactionTableRow key={item.id} item={item} onView={() => onView(item)} />
      ))}
    </View>
  );
}

function TransactionTableRow({ item, onView }) {
  const isCredit = item.direction === "credit";
  const statusStyle = getStatusStyle(item.status);

  return (
    <View style={styles.tableRow}>
      <View style={[styles.memberCell, { flex: 1.35 }]}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>
            {item.memberName ? item.memberName[0] : "?"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.tableName} numberOfLines={1}>
            {item.memberName}
          </Text>
          <Text style={styles.tableSub} numberOfLines={1}>
            {item.memberCode || item.username || "No member ID"}
          </Text>
        </View>
      </View>

      <Text style={[styles.td, { flex: 1.2 }]} numberOfLines={1}>
        {item.type}
      </Text>

      <Text style={isCredit ? styles.tdGreen : styles.tdRed}>
        {isCredit ? "+" : "-"}
        {formatCurrency(item.amount)}
      </Text>

      <Text style={styles.td}>{isCredit ? "In" : "Out"}</Text>
      <Text style={styles.td}>{item.recordMonth || "No month"}</Text>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusStyle.backgroundColor,
            borderColor: statusStyle.borderColor,
          },
        ]}
      >
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {item.status}
        </Text>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

function TransactionCard({ item, onPress }) {
  const isCredit = item.direction === "credit";
  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={onPress}>
      <View style={styles.transactionTop}>
        <View style={styles.transactionIcon}>
          <Feather
            name={isCredit ? "arrow-down-left" : "arrow-up-right"}
            size={18}
            color={isCredit ? "#166534" : "#b91c1c"}
          />
        </View>

        <View style={styles.transactionTitleBox}>
          <Text style={styles.transactionType}>{item.type}</Text>
          <Text style={styles.transactionReference}>{item.referenceNo}</Text>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            isCredit ? styles.amountIn : styles.amountOut,
          ]}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.transactionMeta}>
        <Text style={styles.transactionMember}>
          {item.memberName} · {item.memberCode || item.username || "No ID"}
        </Text>
      </View>

      <View style={styles.transactionMeta}>
        <Text style={styles.transactionDate}>
          {formatDate(item.date)}
          {formatTime(item.date) ? ` • ${formatTime(item.date)}` : ""}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusStyle.backgroundColor,
              borderColor: statusStyle.borderColor,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.detailLabel}>Source</Text>
        <Text style={styles.detailValue}>{item.source}</Text>

        <Text style={styles.detailLabelSpacing}>Remarks</Text>
        <Text style={styles.detailValue}>{item.remarks}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TransactionDetailsModal({
  visible,
  transaction,
  loading,
  onClose,
  onComplete,
  onPending,
  onDelete,
}) {
  if (!transaction) {
    return null;
  }

  const isCredit = transaction.direction === "credit";
  const statusStyle = getStatusStyle(transaction.status);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModal}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <Text style={styles.modalSubtitle}>
                {transaction.memberName} · {transaction.memberCode || transaction.username}
              </Text>
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmountLabel}>
                {isCredit ? "Total In" : "Total Out"}
              </Text>

              <Text style={isCredit ? styles.modalAmountIn : styles.modalAmountOut}>
                {isCredit ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                    borderColor: statusStyle.borderColor,
                    alignSelf: "center",
                    marginTop: 10,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {transaction.status}
                </Text>
              </View>
            </View>

            <DetailRow label="Transaction Code" value={transaction.transactionCode} />
            <DetailRow label="Reference No." value={transaction.referenceNo} />
            <DetailRow label="Transaction Type" value={transaction.type} />
            <DetailRow label="Direction" value={isCredit ? "Credit / In" : "Debit / Out"} />
            <DetailRow label="Member Name" value={transaction.memberName} />
            <DetailRow label="Member ID" value={transaction.memberCode || "No member ID"} />
            <DetailRow label="Username" value={transaction.username || "No username"} />
            <DetailRow label="Record Month" value={transaction.recordMonth || "No month"} />
            <DetailRow label="Source" value={transaction.source} />
            <DetailRow label="Balance Field" value={transaction.balanceField || "Not specified"} />
            <DetailRow
              label="Balance Before"
              value={
                transaction.balanceBefore === null
                  ? "Not recorded"
                  : formatCurrency(transaction.balanceBefore)
              }
            />
            <DetailRow
              label="Balance After"
              value={
                transaction.balanceAfter === null
                  ? "Not recorded"
                  : formatCurrency(transaction.balanceAfter)
              }
            />
            <DetailRow
              label="Date"
              value={`${formatDate(transaction.date)} ${
                formatTime(transaction.date) ? `• ${formatTime(transaction.date)}` : ""
              }`}
            />
            <DetailRow label="Remarks" value={transaction.remarks} />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.pendingButton}
              onPress={onPending}
              disabled={loading}
            >
              <Text style={styles.pendingButtonText}>Mark Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={onComplete}
              disabled={loading}
            >
              <Text style={styles.completeButtonText}>Mark Completed</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={onDelete} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather name="trash-2" size={16} color="#ffffff" />
                <Text style={styles.deleteButtonText}>Delete Transaction</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

function BottomNav({ router }) {
  return (
    <View style={styles.bottomNav}>
      <BottomTab
        icon="bar-chart-2"
        label="Overview"
        active={false}
        onPress={() => router.push("/admin/AdminDashboardScreen")}
      />

      <BottomTab
        icon="users"
        label="Members"
        active={false}
        onPress={() =>
          router.push({
            pathname: "/admin/AdminDashboardScreen",
            params: { tab: "members" },
          })
        }
      />

      <BottomTab
        icon="upload-cloud"
        label="Upload"
        active={false}
        onPress={() => router.push("/admin/AdminUploadCSVScreen")}
      />

      <BottomTab icon="clock" label="History" active onPress={() => {}} />

      <BottomTab
        icon="user"
        label="Profile"
        active={false}
        onPress={() =>
          router.push({
            pathname: "/admin/AdminDashboardScreen",
            params: { tab: "profile" },
          })
        }
      />
    </View>
  );
}

function BottomTab({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomTab} onPress={onPress}>
      <Feather name={icon} size={20} color={active ? GOLD : "#50906e"} />
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

  backButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },

  backButtonText: {
    color: DARK_GREEN,
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
    fontSize: 24,
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

  actionPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
  },

  actionButtonRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
    marginTop: Platform.OS === "web" ? 0 : 14,
  },

  primaryActionButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: MAIN_GREEN,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Platform.OS === "web" ? 10 : 0,
    marginTop: Platform.OS === "web" ? 0 : 10,
  },

  primaryActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 8,
  },

  secondaryActionButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryActionText: {
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 8,
  },

  filterPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
  },

  searchBox: {
    height: 44,
    borderRadius: 13,
    backgroundColor: "#fffdf5",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    color: "#052e1d",
    fontSize: 13,
    marginLeft: 9,
    height: "100%",
    outlineStyle: "none",
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
    minHeight: 66,
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

  tdGreen: {
    flex: 1,
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  tdRed: {
    flex: 1,
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "900",
  },

  statusBadge: {
    flex: 1,
    maxWidth: 105,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: "center",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  viewButton: {
    flex: 1,
    maxWidth: 80,
    height: 32,
    borderRadius: 9,
    backgroundColor: LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
  },

  viewButtonText: {
    color: MAIN_GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  transactionCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eadfca",
    marginBottom: 12,
  },

  transactionTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eadfca",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  transactionTitleBox: {
    flex: 1,
  },

  transactionType: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: "900",
  },

  transactionReference: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  amountIn: {
    color: "#166534",
  },

  amountOut: {
    color: "#b91c1c",
  },

  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
  },

  transactionMember: {
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: "900",
    flex: 1,
  },

  transactionDate: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },

  transactionDetails: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eadfca",
  },

  detailLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  detailLabelSpacing: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 10,
  },

  detailValue: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 18,
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },

  loadingText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "700",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 28,
  },

  emptyTitle: {
    color: DARK_GREEN,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  detailsModal: {
    width: Platform.OS === "web" ? 620 : "100%",
    maxWidth: 660,
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: GOLD,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    color: DARK_GREEN,
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

  modalAmountBox: {
    backgroundColor: "#fffaf0",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eadfca",
    marginBottom: 14,
  },

  modalAmountLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  modalAmountIn: {
    color: "#166534",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },

  modalAmountOut: {
    color: "#b91c1c",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },

  detailRow: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: "#f3ead0",
    paddingVertical: 10,
  },

  detailRowLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  detailRowValue: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 19,
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 14,
  },

  pendingButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#fcd34d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  pendingButtonText: {
    color: "#92400e",
    fontSize: 13,
    fontWeight: "900",
  },

  completeButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#86efac",
    justifyContent: "center",
    alignItems: "center",
  },

  completeButtonText: {
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  deleteButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  deleteButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
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