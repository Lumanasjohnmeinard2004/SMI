// app/member/TransactionHistoryScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MemberScreen, SectionCard, theme } from "../../components/MemberUI";
import { apiRequest } from "../../config/api";

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

function getTransactionDirection(transaction) {
  const direction = String(transaction.direction || "").toLowerCase();
  const type = String(transaction.type || "").toLowerCase();

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
    type.includes("charge")
  ) {
    return "debit";
  }

  return "credit";
}

function getStatusStyle(status) {
  const cleanStatus = String(status || "Completed").toLowerCase();

  if (cleanStatus === "completed" || cleanStatus === "approved" || cleanStatus === "paid") {
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
    rawItem.type ||
    rawItem.transaction_type ||
    rawItem.category ||
    rawItem.title ||
    "Transaction";

  const date =
    rawItem.date ||
    rawItem.transaction_date ||
    rawItem.created_at ||
    rawItem.updated_at ||
    rawItem.posted_at ||
    null;

  const amount = Number(rawItem.amount || rawItem.transaction_amount || rawItem.value || 0);

  const referenceNo =
    rawItem.referenceNo ||
    rawItem.reference_no ||
    rawItem.reference ||
    rawItem.or_number ||
    rawItem.receipt_no ||
    rawItem.id ||
    `TXN-${index + 1}`;

  return {
    id: String(rawItem.id || rawItem.transaction_id || referenceNo || index),
    referenceNo: String(referenceNo),
    type: String(type),
    amount,
    direction: getTransactionDirection({
      direction: rawItem.direction,
      type,
    }),
    status: String(rawItem.status || rawItem.transaction_status || "Completed"),
    date,
    channel: String(rawItem.channel || rawItem.payment_channel || rawItem.source || "System"),
    remarks: String(rawItem.remarks || rawItem.notes || rawItem.description || "No remarks"),
    balanceAfter:
      rawItem.balance_after ||
      rawItem.running_balance ||
      rawItem.current_balance ||
      null,
  };
}

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const identifier =
    params.member_id ||
    params.memberId ||
    params.username ||
    params.id ||
    params.userId ||
    "msantos";

  const memberName = params.memberName || params.full_name || "Member";

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    loadTransactions();
  }, [identifier]);

  async function loadTransactions() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(
        `/members/${encodeURIComponent(identifier)}/transactions`,
        "GET"
      );

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
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Failed to load transaction history. Please check your transaction API endpoint."
      );
    } finally {
      setLoading(false);
    }
  }

  const transactionTypes = useMemo(() => {
    const uniqueTypes = transactions.map((item) => item.type);
    return ["All", ...Array.from(new Set(uniqueTypes))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesType = selectedType === "All" || item.type === selectedType;

      const matchesSearch =
        keyword.length === 0 ||
        item.type.toLowerCase().includes(keyword) ||
        item.referenceNo.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        item.channel.toLowerCase().includes(keyword) ||
        item.remarks.toLowerCase().includes(keyword);

      return matchesType && matchesSearch;
    });
  }, [transactions, selectedType, searchText]);

  const totalIn = useMemo(() => {
    return transactions
      .filter((item) => item.direction === "credit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [transactions]);

  const totalOut = useMemo(() => {
    return transactions
      .filter((item) => item.direction === "debit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [transactions]);

  if (loading) {
    return (
      <MemberScreen
        active="Profile"
        title="Transaction History"
        subtitle="Your member transaction records."
      >
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading transaction history...</Text>
          </View>
        </SectionCard>
      </MemberScreen>
    );
  }

  if (errorMessage) {
    return (
      <MemberScreen
        active="Profile"
        title="Transaction History"
        subtitle="Your member transaction records."
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={theme.greenDark} />
          <Text style={styles.backButtonText}>Back to Profile</Text>
        </TouchableOpacity>

        <SectionCard title="Unable to Load Transactions">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <Text style={styles.helperText}>
            Make sure your backend has this route:
          </Text>

          <Text style={styles.endpointText}>
            GET /members/{identifier}/transactions
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadTransactions}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      </MemberScreen>
    );
  }

  return (
    <MemberScreen
      active="Profile"
      title="Transaction History"
      subtitle={`${memberName} • ${identifier}`}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color={theme.greenDark} />
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>

      <View style={styles.summaryHero}>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons
            name="clipboard-text-clock-outline"
            size={28}
            color={theme.gold}
          />
        </View>

        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Net Movement</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalIn - totalOut)}</Text>
          <Text style={styles.summarySubtext}>
            Based on your recorded transactions
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summarySmallCard}>
          <Text style={styles.summarySmallLabel}>Total In</Text>
          <Text style={styles.summaryIn}>{formatCurrency(totalIn)}</Text>
        </View>

        <View style={styles.summarySmallCard}>
          <Text style={styles.summarySmallLabel}>Total Out</Text>
          <Text style={styles.summaryOut}>{formatCurrency(totalOut)}</Text>
        </View>
      </View>

      <SectionCard title="Search & Filter">
        <TextInput
          style={styles.searchInput}
          placeholder="Search reference, type, status, or remarks"
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {transactionTypes.map((type) => {
            const active = selectedType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SectionCard>

      <SectionCard title={`Records (${filteredTransactions.length})`}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={34}
              color={theme.muted}
            />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or selected filter.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const isCredit = item.direction === "credit";

            return (
              <View key={item.id} style={styles.transactionCard}>
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
                    <Text style={styles.transactionReference}>
                      {item.referenceNo}
                    </Text>
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
                  <Text style={styles.detailLabel}>Channel</Text>
                  <Text style={styles.detailValue}>{item.channel}</Text>

                  <Text style={styles.detailLabelSpacing}>Remarks</Text>
                  <Text style={styles.detailValue}>{item.remarks}</Text>

                  {item.balanceAfter !== null && item.balanceAfter !== undefined ? (
                    <>
                      <Text style={styles.detailLabelSpacing}>Balance After</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(item.balanceAfter)}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </SectionCard>
    </MemberScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffaf0",
    borderWidth: 1,
    borderColor: "#eadfca",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  backButtonText: {
    color: theme.greenDark,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 8,
  },

  summaryHero: {
    backgroundColor: theme.greenDark,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.gold,
  },

  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(200,155,44,0.16)",
    borderWidth: 1,
    borderColor: "rgba(200,155,44,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryLabel: {
    color: "#d7e8dc",
    fontSize: 12,
    fontWeight: "800",
  },

  summaryValue: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 4,
  },

  summarySubtext: {
    color: "#d7e8dc",
    fontSize: 11,
    marginTop: 4,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  summarySmallCard: {
    flex: 1,
    backgroundColor: "#fffaf0",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eadfca",
  },

  summarySmallLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  summaryIn: {
    color: "#166534",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
  },

  summaryOut: {
    color: "#b91c1c",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
  },

  searchInput: {
    height: 46,
    backgroundColor: "#fffaf0",
    borderWidth: 1,
    borderColor: "#eadfca",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: theme.greenDark,
    fontSize: 13,
    fontWeight: "700",
  },

  filterChips: {
    paddingTop: 12,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fffaf0",
    borderWidth: 1,
    borderColor: "#eadfca",
  },

  filterChipActive: {
    backgroundColor: theme.green,
    borderColor: theme.green,
  },

  filterChipText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: "#ffffff",
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
    color: theme.greenDark,
    fontSize: 14,
    fontWeight: "900",
  },

  transactionReference: {
    color: theme.muted,
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

  transactionDate: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
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
    color: theme.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  detailLabelSpacing: {
    color: theme.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 10,
  },

  detailValue: {
    color: theme.greenDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 18,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 22,
  },

  emptyTitle: {
    color: theme.greenDark,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyText: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
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
    marginBottom: 12,
    fontWeight: "700",
  },

  helperText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  endpointText: {
    color: theme.greenDark,
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: "#fffaf0",
    borderWidth: 1,
    borderColor: "#eadfca",
    borderRadius: 10,
    padding: 10,
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