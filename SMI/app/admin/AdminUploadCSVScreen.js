// app/admin/AdminUploadCSVScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import SmiLogo from "../../components/SmiLogo";
import { apiRequest } from "../../config/api";

const GOLD = "#c89b2c";
const DARK_GREEN = "#06472f";
const MAIN_GREEN = "#009060";
const LIGHT_GREEN = "#e6fff2";
const PAGE_BG = "#f6fbf8";

function currency(value) {
  const numberValue = Number(value || 0);

  return `₱${numberValue.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const emptyForm = {
  memberIdentifier: "",

  shareCapital: "",
  savings: "",
  specialSavings: "",
  dividendAmount: "",

  regularLoan: "",
  regularLoanDiminishing: "",
  educationalLoan: "",
  educationalLoanDiminishing: "",
  shortTermLoan: "",
  shortTermLoanDiminishing: "",
  applianceLoan: "",
  applianceLoanDiminishing: "",
  medicalLoan: "",
  medicalLoanDiminishing: "",
  pettyCashLoan: "",
  vehicleLoan: "",
  interTradingLoan: "",

  regularLoanDueDate: "",
  regularLoanDiminishingDueDate: "",
  educationalLoanDueDate: "",
  educationalLoanDiminishingDueDate: "",
  shortTermLoanDueDate: "",
  shortTermLoanDiminishingDueDate: "",
  applianceLoanDueDate: "",
  applianceLoanDiminishingDueDate: "",
  medicalLoanDueDate: "",
  medicalLoanDiminishingDueDate: "",
  pettyCashLoanDueDate: "",
  vehicleLoanDueDate: "",
  interTradingLoanDueDate: "",
};

export default function AdminUploadCSVScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 900;

  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("manual");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const totalLoanBalance =
    Number(formData.regularLoan || 0) +
    Number(formData.regularLoanDiminishing || 0) +
    Number(formData.educationalLoan || 0) +
    Number(formData.educationalLoanDiminishing || 0) +
    Number(formData.shortTermLoan || 0) +
    Number(formData.shortTermLoanDiminishing || 0) +
    Number(formData.applianceLoan || 0) +
    Number(formData.applianceLoanDiminishing || 0) +
    Number(formData.medicalLoan || 0) +
    Number(formData.medicalLoanDiminishing || 0) +
    Number(formData.pettyCashLoan || 0) +
    Number(formData.vehicleLoan || 0) +
    Number(formData.interTradingLoan || 0);

  async function loadMembers() {
    try {
      setLoadingMembers(true);

      const data = await apiRequest("/members", "GET");
      setMembers(data.members || []);
    } catch (error) {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  function updateField(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function pickCSVFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  }

  function clearManualForm() {
    setFormData(emptyForm);
    setMessage("");
    setIsError(false);
  }

  async function saveManualRecord() {
    try {
      setMessage("");
      setIsError(false);

      if (!formData.memberIdentifier.trim()) {
        setIsError(true);
        setMessage("Please enter an existing Member ID or username.");
        return;
      }

      setSaving(true);

      const data = await apiRequest("/members/manual-financial-record", "POST", {
        member_identifier: formData.memberIdentifier.trim(),

        share_capital: formData.shareCapital,
        savings: formData.savings,
        special_savings: formData.specialSavings,
        dividend_amount: formData.dividendAmount,

        regular_loan: formData.regularLoan,
        regular_loan_diminishing: formData.regularLoanDiminishing,

        educational_loan: formData.educationalLoan,
        educational_loan_diminishing: formData.educationalLoanDiminishing,

        short_term_loan: formData.shortTermLoan,
        short_term_loan_diminishing: formData.shortTermLoanDiminishing,

        appliance_loan: formData.applianceLoan,
        appliance_loan_diminishing: formData.applianceLoanDiminishing,

        medical_loan: formData.medicalLoan,
        medical_loan_diminishing: formData.medicalLoanDiminishing,

        petty_cash_loan: formData.pettyCashLoan,
        vehicle_loan: formData.vehicleLoan,
        inter_trading_loan: formData.interTradingLoan,

        regular_loan_due_date: formData.regularLoanDueDate,
        regular_loan_diminishing_due_date: formData.regularLoanDiminishingDueDate,

        educational_loan_due_date: formData.educationalLoanDueDate,
        educational_loan_diminishing_due_date: formData.educationalLoanDiminishingDueDate,

        short_term_loan_due_date: formData.shortTermLoanDueDate,
        short_term_loan_diminishing_due_date: formData.shortTermLoanDiminishingDueDate,

        appliance_loan_due_date: formData.applianceLoanDueDate,
        appliance_loan_diminishing_due_date: formData.applianceLoanDiminishingDueDate,

        medical_loan_due_date: formData.medicalLoanDueDate,
        medical_loan_diminishing_due_date: formData.medicalLoanDiminishingDueDate,

        petty_cash_loan_due_date: formData.pettyCashLoanDueDate,
        vehicle_loan_due_date: formData.vehicleLoanDueDate,
        inter_trading_loan_due_date: formData.interTradingLoanDueDate,
      });

      setIsError(false);
      setMessage(
        `${data.member.full_name}'s financial record was added successfully.`
      );

      await loadMembers();
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to save manual record.");
    } finally {
      setSaving(false);
    }
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
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={mode === "upload" ? styles.modeTabActive : styles.modeTab}
                onPress={() => setMode("upload")}
              >
                <Feather
                  name="upload-cloud"
                  size={16}
                  color={mode === "upload" ? "#ffffff" : MAIN_GREEN}
                />
                <Text style={mode === "upload" ? styles.modeTextActive : styles.modeText}>
                  CSV Upload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={mode === "manual" ? styles.modeTabActive : styles.modeTab}
                onPress={() => setMode("manual")}
              >
                <Feather
                  name="edit-3"
                  size={16}
                  color={mode === "manual" ? "#ffffff" : MAIN_GREEN}
                />
                <Text style={mode === "manual" ? styles.modeTextActive : styles.modeText}>
                  Manual Input
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "upload" ? (
              <UploadContent
                selectedFile={selectedFile}
                pickCSVFile={pickCSVFile}
                isDesktopWeb={isDesktopWeb}
              />
            ) : (
              <ManualContent
                formData={formData}
                updateField={updateField}
                clearManualForm={clearManualForm}
                totalLoanBalance={totalLoanBalance}
                saveManualRecord={saveManualRecord}
                saving={saving}
                message={message}
                isError={isError}
                members={members}
                loadingMembers={loadingMembers}
                isDesktopWeb={isDesktopWeb}
              />
            )}
          </ScrollView>

          {!isDesktopWeb && <BottomNav router={router} />}
        </View>
      </View>
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

        <SidebarItem icon="upload-cloud" label="Upload Records" active onPress={() => {}} />

        <SidebarItem
          icon="clipboard"
          label="Loan Requests"
          active={false}
          badge="1"
          onPress={() =>
            router.push({
              pathname: "/admin/AdminDashboardScreen",
              params: { tab: "requests" },
            })
          }
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
          <Ionicons name="cloud-upload-outline" size={14} color={GOLD} />
          <Text style={styles.portalText}>ADMIN UPLOAD</Text>
        </View>

        <Text style={styles.topTitle}>Upload Records</Text>
        <Text style={styles.topSubtitle}>
          Import CSV files or manually encode member financial data
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

function UploadContent({ selectedFile, pickCSVFile, isDesktopWeb }) {
  return (
    <View style={isDesktopWeb ? styles.uploadGrid : null}>
      <View style={[styles.panelCard, isDesktopWeb && styles.uploadMainPanel]}>
        <View style={styles.uploadDropZone}>
          <View style={styles.uploadIcon}>
            <Feather name="upload-cloud" size={44} color={MAIN_GREEN} />
          </View>

          <Text style={styles.uploadTitle}>Select CSV or Excel File</Text>

          <Text style={styles.uploadSub}>
            Upload member records, savings, share capital, special savings,
            loan balances, and loan due dates.
          </Text>

          <TouchableOpacity style={styles.chooseButton} onPress={pickCSVFile}>
            <Feather name="file-plus" size={18} color="#ffffff" />
            <Text style={styles.chooseText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.fileCard}>
            <View style={styles.fileIconBox}>
              <Feather name="file-text" size={26} color={MAIN_GREEN} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                  : "File selected"}
              </Text>
            </View>

            <Ionicons name="checkmark-circle" size={24} color={MAIN_GREEN} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.uploadButton, !selectedFile && styles.uploadDisabled]}
          disabled={!selectedFile}
        >
          <Feather name="upload" size={18} color="#ffffff" />
          <Text style={styles.uploadButtonText}>Upload and Process File</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.panelCard, isDesktopWeb && styles.uploadSidePanel]}>
        <Text style={styles.sectionTitle}>Required CSV Columns</Text>
        <Text style={styles.sectionSub}>
          Make sure your uploaded file follows this structure.
        </Text>

        <View style={styles.infoList}>
          <InfoLine text="Member ID or username" />
          <InfoLine text="Share Capital, Savings, Special Savings" />
          <InfoLine text="All loan type balances" />
          <InfoLine text="Loan due dates in YYYY-MM-DD format" />
          <InfoLine text="Dividend Amount" />
        </View>

        <View style={styles.noteBox}>
          <Feather name="info" size={18} color={GOLD} />
          <Text style={styles.noteText}>
            Manual input now adds new values to existing balances. Due date fields update only when filled.
          </Text>
        </View>
      </View>
    </View>
  );
}

function ManualContent({
  formData,
  updateField,
  clearManualForm,
  totalLoanBalance,
  saveManualRecord,
  saving,
  message,
  isError,
  members,
  loadingMembers,
  isDesktopWeb,
}) {
  return (
    <View>
      {message ? (
        <View style={isError ? styles.errorBox : styles.successBox}>
          <Feather
            name={isError ? "alert-circle" : "check-circle"}
            size={17}
            color={isError ? "#991b1b" : "#047857"}
          />
          <Text style={isError ? styles.errorText : styles.successText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Select Existing Member</Text>
        <Text style={styles.sectionSub}>
          Enter the member ID or username. New values will be added to the current record.
        </Text>

        <InputField
          label="Member ID or Username"
          value={formData.memberIdentifier}
          onChangeText={(value) => updateField("memberIdentifier", value)}
          placeholder="e.g. SMI-001 or msantos"
        />

        <View style={styles.memberHintBox}>
          <Text style={styles.memberHintTitle}>Existing members</Text>

          {loadingMembers ? (
            <Text style={styles.memberHintText}>Loading members...</Text>
          ) : members.length === 0 ? (
            <Text style={styles.memberHintText}>No members found.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberChip}
                  onPress={() => updateField("memberIdentifier", member.member_id)}
                >
                  <Text style={styles.memberChipName}>{member.full_name}</Text>
                  <Text style={styles.memberChipSub}>
                    {member.member_id} · @{member.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Savings Information</Text>
        <Text style={styles.sectionSub}>
          These amounts will be added to the member's existing balances.
        </Text>

        <View style={isDesktopWeb ? styles.formGridFour : null}>
          <InputField
            label="Share Capital"
            value={formData.shareCapital}
            onChangeText={(value) => updateField("shareCapital", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Savings"
            value={formData.savings}
            onChangeText={(value) => updateField("savings", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Special Savings"
            value={formData.specialSavings}
            onChangeText={(value) => updateField("specialSavings", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Dividend Amount"
            value={formData.dividendAmount}
            onChangeText={(value) => updateField("dividendAmount", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Loan Balances</Text>
        <Text style={styles.sectionSub}>
          These loan amounts will be added to the existing loan balances.
        </Text>

        <View style={isDesktopWeb ? styles.formGridFour : null}>
          <InputField label="Regular Loan" value={formData.regularLoan} onChangeText={(value) => updateField("regularLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Regular Loan - Diminishing" value={formData.regularLoanDiminishing} onChangeText={(value) => updateField("regularLoanDiminishing", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Educational Loan" value={formData.educationalLoan} onChangeText={(value) => updateField("educationalLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Educational Loan - Diminishing" value={formData.educationalLoanDiminishing} onChangeText={(value) => updateField("educationalLoanDiminishing", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Short-term Loan" value={formData.shortTermLoan} onChangeText={(value) => updateField("shortTermLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Short-term Loan - Diminishing" value={formData.shortTermLoanDiminishing} onChangeText={(value) => updateField("shortTermLoanDiminishing", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Appliance Loan" value={formData.applianceLoan} onChangeText={(value) => updateField("applianceLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Appliance Loan - Diminishing" value={formData.applianceLoanDiminishing} onChangeText={(value) => updateField("applianceLoanDiminishing", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Medical Loan" value={formData.medicalLoan} onChangeText={(value) => updateField("medicalLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Medical Loan - Diminishing" value={formData.medicalLoanDiminishing} onChangeText={(value) => updateField("medicalLoanDiminishing", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Petty Cash Loan" value={formData.pettyCashLoan} onChangeText={(value) => updateField("pettyCashLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Vehicle Loan" value={formData.vehicleLoan} onChangeText={(value) => updateField("vehicleLoan", value)} placeholder="0.00" keyboardType="numeric" />
          <InputField label="Inter-Trading Loan" value={formData.interTradingLoan} onChangeText={(value) => updateField("interTradingLoan", value)} placeholder="0.00" keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Loan Due Dates</Text>
        <Text style={styles.sectionSub}>
          Use YYYY-MM-DD format. Blank fields will keep the old due date.
        </Text>

        <View style={isDesktopWeb ? styles.formGridFour : null}>
          <InputField label="Regular Loan Due Date" value={formData.regularLoanDueDate} onChangeText={(value) => updateField("regularLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Regular Diminishing Due Date" value={formData.regularLoanDiminishingDueDate} onChangeText={(value) => updateField("regularLoanDiminishingDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Educational Loan Due Date" value={formData.educationalLoanDueDate} onChangeText={(value) => updateField("educationalLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Educational Diminishing Due Date" value={formData.educationalLoanDiminishingDueDate} onChangeText={(value) => updateField("educationalLoanDiminishingDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Short-term Loan Due Date" value={formData.shortTermLoanDueDate} onChangeText={(value) => updateField("shortTermLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Short-term Diminishing Due Date" value={formData.shortTermLoanDiminishingDueDate} onChangeText={(value) => updateField("shortTermLoanDiminishingDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Appliance Loan Due Date" value={formData.applianceLoanDueDate} onChangeText={(value) => updateField("applianceLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Appliance Diminishing Due Date" value={formData.applianceLoanDiminishingDueDate} onChangeText={(value) => updateField("applianceLoanDiminishingDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Medical Loan Due Date" value={formData.medicalLoanDueDate} onChangeText={(value) => updateField("medicalLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Medical Diminishing Due Date" value={formData.medicalLoanDiminishingDueDate} onChangeText={(value) => updateField("medicalLoanDiminishingDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Petty Cash Due Date" value={formData.pettyCashLoanDueDate} onChangeText={(value) => updateField("pettyCashLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Vehicle Loan Due Date" value={formData.vehicleLoanDueDate} onChangeText={(value) => updateField("vehicleLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
          <InputField label="Inter-Trading Due Date" value={formData.interTradingLoanDueDate} onChangeText={(value) => updateField("interTradingLoanDueDate", value)} placeholder="YYYY-MM-DD" maxLength={10} />
        </View>
      </View>

      <View style={isDesktopWeb ? styles.actionGrid : null}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>NEW LOAN AMOUNT TO ADD</Text>
          <Text style={styles.totalAmount}>{currency(totalLoanBalance)}</Text>
        </View>

        <View style={styles.actionPanel}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveManualRecord}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather name="save" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Manual Record</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearManualForm}>
            <Feather name="refresh-cw" size={17} color="#e23b3b" />
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

function InfoLine({ text }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name="checkmark-circle-outline" size={17} color={MAIN_GREEN} />
      <Text style={styles.infoText}>{text}</Text>
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

      <BottomTab icon="upload-cloud" label="Upload" active onPress={() => {}} />

      <BottomTab
        icon="clipboard"
        label="Reqs"
        active={false}
        badge="1"
        onPress={() =>
          router.push({
            pathname: "/admin/AdminDashboardScreen",
            params: { tab: "requests" },
          })
        }
      />

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
    fontSize: Platform.OS === "web" ? 28 : 22,
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

  modeTabs: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: "#efe2bd",
    flexDirection: "row",
    marginBottom: 18,
  },

  modeTab: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e5d4a2",
    backgroundColor: "#fffdf5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },

  modeTabActive: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },

  modeText: {
    color: MAIN_GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  modeTextActive: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#efe2bd",
    marginBottom: 18,
  },

  uploadGrid: {
    flexDirection: "row",
    gap: 20,
  },

  uploadMainPanel: {
    flex: 1,
  },

  uploadSidePanel: {
    width: 390,
  },

  uploadDropZone: {
    minHeight: 300,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#8ee4bf",
    backgroundColor: "#f7fffb",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },

  uploadIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  uploadTitle: {
    color: "#052e1d",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  uploadSub: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
    maxWidth: 520,
  },

  chooseButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  chooseText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  fileCard: {
    backgroundColor: "#f0fff8",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#86efac",
  },

  fileIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  fileName: {
    color: "#052e1d",
    fontSize: 14,
    fontWeight: "900",
  },

  fileSize: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
  },

  uploadButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 16,
  },

  uploadDisabled: {
    backgroundColor: "#9fcfba",
  },

  uploadButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  sectionTitle: {
    color: "#052e1d",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSub: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 16,
  },

  infoList: {
    marginTop: 6,
  },

  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  infoText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },

  noteBox: {
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginTop: 12,
  },

  noteText: {
    flex: 1,
    color: "#795700",
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
  },

  formGridFour: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  inputGroup: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 230 : "100%",
    marginBottom: 14,
  },

  inputLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d4a2",
    backgroundColor: "#fffdf5",
    paddingHorizontal: 14,
    color: "#052e1d",
    fontSize: 14,
  },

  memberHintBox: {
    backgroundColor: "#f7fffb",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#c7f3dd",
    padding: 14,
  },

  memberHintTitle: {
    color: "#052e1d",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },

  memberHintText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },

  memberChip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5d4a2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },

  memberChipName: {
    color: "#052e1d",
    fontSize: 13,
    fontWeight: "900",
  },

  memberChipSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 3,
  },

  actionGrid: {
    flexDirection: "row",
    gap: 20,
  },

  totalCard: {
    flex: 1,
    backgroundColor: DARK_GREEN,
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: GOLD,
  },

  totalLabel: {
    color: "#d8c07a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  totalAmount: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8,
  },

  actionPanel: {
    width: Platform.OS === "web" ? 320 : "100%",
    marginBottom: 18,
  },

  saveButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: MAIN_GREEN,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  clearButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff7f7",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  clearButtonText: {
    color: "#e23b3b",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  errorBox: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 9,
  },

  successBox: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  successText: {
    flex: 1,
    color: "#047857",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 9,
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