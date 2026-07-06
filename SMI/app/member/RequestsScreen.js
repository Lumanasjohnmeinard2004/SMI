// app/member/RequestsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  StatusBadge,
  theme,
} from "../../components/MemberUI";
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
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getLoanIcon(loanType) {
  const value = String(loanType || "").toLowerCase();

  if (value.includes("education")) {
    return "school-outline";
  }

  if (value.includes("medical")) {
    return "medical-bag";
  }

  if (value.includes("vehicle")) {
    return "car-outline";
  }

  if (value.includes("appliance")) {
    return "fridge-outline";
  }

  return "wallet-outline";
}

function getDefaultNote(status) {
  if (status === "Pending") {
    return "Under review";
  }

  if (status === "Approved") {
    return "Approved by admin";
  }

  if (status === "Rejected") {
    return "Rejected by admin";
  }

  return "Request updated";
}

export default function RequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const identifier =
    params.member_id || params.username || params.id || params.userId || "msantos";

  const memberParams = {
    id: params.id,
    member_id: params.member_id,
    username: params.username,
    full_name: params.full_name,
    status: params.status,
  };

  const [filter, setFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRequests();
  }, [identifier]);

  async function loadRequests() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await apiRequest(`/requests/member/${identifier}`, "GET");

      setRequests(data.requests || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((request) => request.status === filter);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  return (
    <MemberScreen
      active="Requests"
      title="My Requests"
      subtitle="Track your loan and service requests."
    >
      <TouchableOpacity
        style={styles.createButton}
        onPress={() =>
          router.push({
            pathname: "/member/CreateRequestScreen",
            params: memberParams,
          })
        }
      >
        <Feather name="plus-circle" size={18} color="#ffffff" />
        <Text style={styles.createButtonText}>Create Request</Text>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          active={filter === "All"}
          onPress={() => setFilter("All")}
        />

        <FilterChip
          label="Pending"
          active={filter === "Pending"}
          onPress={() => setFilter("Pending")}
        />

        <FilterChip
          label="Approved"
          active={filter === "Approved"}
          onPress={() => setFilter("Approved")}
        />

        <FilterChip
          label="Rejected"
          active={filter === "Rejected"}
          onPress={() => setFilter("Rejected")}
        />
      </View>

      <PrimaryCard
        label="TOTAL REQUESTS"
        amount={String(requests.length)}
        sub={`${pendingCount} pending request${pendingCount === 1 ? "" : "s"}`}
      />

      {loading ? (
        <SectionCard title="Loading">
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        </SectionCard>
      ) : errorMessage ? (
        <SectionCard title="Unable to Load Requests">
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadRequests}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SectionCard>
      ) : filteredRequests.length === 0 ? (
        <SectionCard title="No Requests Found">
          <Text style={styles.emptyText}>
            No {filter === "All" ? "" : filter.toLowerCase()} requests found.
          </Text>
        </SectionCard>
      ) : (
        filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            icon={getLoanIcon(request.loan_type)}
            title={request.loan_type}
            amount={formatCurrency(request.amount)}
            date={formatDate(request.requested_at)}
            purpose={request.purpose}
            status={request.status}
            note={request.admin_remarks || getDefaultNote(request.status)}
          />
        ))
      )}
    </MemberScreen>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={active ? styles.filterActive : styles.filterChip}
      onPress={onPress}
    >
      <Text style={active ? styles.filterActiveText : styles.filterText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RequestCard({ icon, title, amount, date, purpose, status, note }) {
  const isPending = status === "Pending";
  const isRejected = status === "Rejected";

  return (
    <SectionCard>
      <View style={styles.requestHeader}>
        <View style={styles.requestIconCircle}>
          <MaterialCommunityIcons name={icon} size={28} color={theme.green} />
        </View>

        <View style={styles.requestTitleWrap}>
          <Text style={styles.requestTitle}>{title}</Text>
          <Text style={styles.requestAmount}>{amount}</Text>
        </View>

        <StatusBadge
          type={isPending ? "pending" : isRejected ? "danger" : "success"}
          text={status}
        />
      </View>

      <View style={styles.detailsWrap}>
        <DetailRow label="Date Requested" value={date} />
        <DetailRow label="Purpose" value={purpose} />
      </View>

      <View
        style={
          isPending
            ? styles.pendingNote
            : isRejected
            ? styles.rejectedNote
            : styles.approvedNote
        }
      >
        <Feather
          name={isPending ? "clock" : isRejected ? "x-circle" : "check-circle"}
          size={15}
          color={
            isPending ? "#e86f00" : isRejected ? theme.danger : theme.success
          }
        />

        <Text
          style={
            isPending
              ? styles.pendingNoteText
              : isRejected
              ? styles.rejectedNoteText
              : styles.approvedNoteText
          }
        >
          {note}
        </Text>

        <Feather name="chevron-right" size={16} color={theme.muted} />
      </View>
    </SectionCard>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  createButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.green,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },

  createButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  filterChip: {
    height: 36,
    minWidth: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.card,
  },

  filterActive: {
    height: 36,
    minWidth: 72,
    borderRadius: 18,
    backgroundColor: theme.green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 10,
  },

  filterText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900",
  },

  filterActiveText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  requestIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  requestTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },

  requestTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
  },

  requestAmount: {
    color: theme.green,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 6,
  },

  detailsWrap: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee9df",
    paddingTop: 12,
  },

  detailRow: {
    marginBottom: 10,
  },

  detailLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },

  detailValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },

  pendingNote: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff4df",
    borderWidth: 1,
    borderColor: "#ffc46b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 4,
  },

  approvedNote: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eafff4",
    borderWidth: 1,
    borderColor: "#83e8b9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 4,
  },

  rejectedNote: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff0ef",
    borderWidth: 1,
    borderColor: "#f1b8b8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 4,
  },

  pendingNoteText: {
    flex: 1,
    color: "#e86f00",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  approvedNoteText: {
    flex: 1,
    color: theme.success,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  rejectedNoteText: {
    flex: 1,
    color: theme.danger,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
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

  emptyText: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});