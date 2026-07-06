// app/member/CreateRequestScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MemberScreen,
  SectionCard,
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

export default function CreateRequestScreen() {
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

  const [loanType, setLoanType] = useState("Regular Loan");
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loanTypes = [
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
    "Other Loan",
  ];

  useEffect(() => {
    loadMemberSummary();
  }, [identifier]);

  async function loadMemberSummary() {
    try {
      setLoadingMember(true);

      const data = await apiRequest(`/members/${identifier}/financials`, "GET");

      setMember(data.member);
    } catch (error) {
      setMember(null);
    } finally {
      setLoadingMember(false);
    }
  }

  async function submitRequest() {
    try {
      setMessage("");
      setIsError(false);

      if (!amount.trim() || Number(amount) <= 0) {
        setIsError(true);
        setMessage("Please enter a valid amount.");
        return;
      }

      if (!purpose.trim()) {
        setIsError(true);
        setMessage("Please enter the purpose of your request.");
        return;
      }

      setSubmitting(true);

      await apiRequest("/requests", "POST", {
        member_identifier: identifier,
        loan_type: loanType,
        amount: amount.trim(),
        purpose: purpose.trim(),
      });

      setIsError(false);
      setMessage("Request submitted successfully.");

      setTimeout(() => {
        router.push({
          pathname: "/member/RequestsScreen",
          params: memberParams,
        });
      }, 700);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MemberScreen
      active="Requests"
      title="Create Request"
      subtitle="Submit a new loan request for review."
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.push({
            pathname: "/member/RequestsScreen",
            params: memberParams,
          })
        }
      >
        <Feather name="arrow-left" size={17} color={theme.green} />
        <Text style={styles.backText}>Back to Requests</Text>
      </TouchableOpacity>

      {message ? (
        <View style={isError ? styles.errorBox : styles.successBox}>
          <Feather
            name={isError ? "alert-circle" : "check-circle"}
            size={16}
            color={isError ? "#991b1b" : theme.success}
          />
          <Text style={isError ? styles.errorText : styles.successText}>
            {message}
          </Text>
        </View>
      ) : null}

      <SectionCard title="Request Details">
        <Text style={styles.label}>Loan Type</Text>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <View style={styles.dropdownLeft}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={20}
              color={theme.green}
            />
            <Text style={styles.dropdownText}>{loanType}</Text>
          </View>

          <Feather
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.muted}
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {loanTypes.map((item) => (
              <TouchableOpacity
                key={item}
                style={
                  loanType === item
                    ? styles.dropdownItemActive
                    : styles.dropdownItem
                }
                onPress={() => {
                  setLoanType(item);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={
                    loanType === item
                      ? styles.dropdownItemTextActive
                      : styles.dropdownItemText
                  }
                >
                  {item}
                </Text>

                {loanType === item && (
                  <Feather name="check" size={16} color={theme.green} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Amount Requested</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#9ba89f"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter purpose of request"
          placeholderTextColor="#9ba89f"
          multiline
          textAlignVertical="top"
          value={purpose}
          onChangeText={setPurpose}
        />
      </SectionCard>

      <SectionCard title="Member Summary">
        {loadingMember ? (
          <View style={styles.summaryLoading}>
            <ActivityIndicator color={theme.green} />
            <Text style={styles.summaryLoadingText}>Loading member summary...</Text>
          </View>
        ) : member ? (
          <>
            <InfoLine label="Member Name" value={member.full_name} />
            <InfoLine label="Member ID" value={member.member_id} />
            <InfoLine label="Current Loan Balance" value={formatCurrency(getTotalLoan(member))} />
            <InfoLine label="Share Capital" value={formatCurrency(member.share_capital)} />
          </>
        ) : (
          <Text style={styles.summaryLoadingText}>Unable to load member summary.</Text>
        )}
      </SectionCard>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitRequest}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Feather name="send" size={18} color="#ffffff" />
            <Text style={styles.submitText}>Submit Request</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() =>
          router.push({
            pathname: "/member/RequestsScreen",
            params: memberParams,
          })
        }
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </MemberScreen>
  );
}

function InfoLine({ label, value }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.greenSoft,
    borderWidth: 1,
    borderColor: "#cde8d5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
    alignSelf: "flex-start",
  },

  backText: {
    color: theme.green,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  label: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 12,
  },

  dropdownButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "#f7f5ef",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dropdownText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 10,
  },

  dropdownMenu: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee9df",
  },

  dropdownItemActive: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: theme.greenSoft,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d5e7dc",
  },

  dropdownItemText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    paddingRight: 8,
  },

  dropdownItemTextActive: {
    color: theme.green,
    fontSize: 13,
    fontWeight: "900",
    flex: 1,
    paddingRight: 8,
  },

  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "#f7f5ef",
    paddingHorizontal: 14,
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
  },

  textArea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "#f7f5ef",
    paddingHorizontal: 14,
    paddingTop: 14,
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
  },

  infoLine: {
    borderTopWidth: 1,
    borderTopColor: "#eee9df",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: theme.muted,
    fontSize: 13,
    flex: 1,
  },

  infoValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },

  submitButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: theme.green,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  cancelButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1c7bd",
    backgroundColor: "#fff8ef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  cancelText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: "900",
  },

  successBox: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#eafff4",
    borderWidth: 1,
    borderColor: "#83e8b9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  successText: {
    flex: 1,
    color: theme.success,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  errorBox: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#fff0ef",
    borderWidth: 1,
    borderColor: "#f1b8b8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    color: theme.danger,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  summaryLoading: {
    alignItems: "center",
    paddingVertical: 12,
  },

  summaryLoadingText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});