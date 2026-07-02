import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  MemberScreen,
  PrimaryCard,
  SectionCard,
  StatusBadge,
  theme,
} from "../../components/MemberUI";

export default function RequestsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  return (
    <MemberScreen
      active="Requests"
      title="My Requests"
      subtitle="Track your loan and service requests."
    >
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/member/CreateRequestScreen")}
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

      <PrimaryCard label="TOTAL REQUESTS" amount="3" sub="1 pending request" />

      <RequestCard
        icon="wallet-outline"
        title="Regular Loan"
        amount="₱25,000.00"
        date="Mar 20, 2025"
        purpose="Business expansion"
        status="Pending"
        note="Under review"
      />

      <RequestCard
        icon="school-outline"
        title="Educational Loan"
        amount="₱15,000.00"
        date="Mar 18, 2025"
        purpose="Tuition payment"
        status="Approved"
        note="Ready for release"
      />

      <RequestCard
        icon="medical-bag"
        title="Medical Loan"
        amount="₱8,000.00"
        date="Mar 15, 2025"
        purpose="Medical expenses"
        status="Rejected"
        note="Insufficient eligibility"
      />
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
});