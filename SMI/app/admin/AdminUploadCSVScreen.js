// app/admin/AdminUploadCSVScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

export default function AdminUploadCSVScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= 900;

  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("upload");

  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    shareCapital: "",
    savings: "",
    specialSavings: "",

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
  });

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
    setFormData({
      firstName: "",
      middleInitial: "",
      lastName: "",
      shareCapital: "",
      savings: "",
      specialSavings: "",

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
    });
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
                  color={mode === "upload" ? "#ffffff" : "#009060"}
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
                  color={mode === "manual" ? "#ffffff" : "#009060"}
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

function TopHeader({ router, isDesktopWeb }) {
  return (
    <View style={styles.topHeader}>
      <View style={styles.topTitleBlock}>
        <View style={styles.portalRow}>
          <Ionicons name="cloud-upload-outline" size={14} color="#16a34a" />
          <Text style={styles.portalText}>ADMIN UPLOAD</Text>
        </View>

        <Text style={styles.topTitle}>Upload Records</Text>
        <Text style={styles.topSubtitle}>
          Import CSV files or manually encode member financial data
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/admin/AdminDashboardScreen")}
        >
          <Feather name="arrow-left" size={18} color="#06472f" />
          {isDesktopWeb && <Text style={styles.backButtonText}>Back to Dashboard</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function UploadContent({ selectedFile, pickCSVFile, isDesktopWeb }) {
  return (
    <View style={isDesktopWeb ? styles.uploadGrid : null}>
      <View style={[styles.panelCard, isDesktopWeb && styles.uploadMainPanel]}>
        <View style={styles.uploadDropZone}>
          <View style={styles.uploadIcon}>
            <Feather name="upload-cloud" size={42} color="#009060" />
          </View>

          <Text style={styles.uploadTitle}>Select CSV or Excel File</Text>

          <Text style={styles.uploadSub}>
            Upload member records, savings, share capital, special savings, and loan balances.
          </Text>

          <TouchableOpacity style={styles.chooseButton} onPress={pickCSVFile}>
            <Feather name="file-plus" size={18} color="#ffffff" />
            <Text style={styles.chooseText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.fileCard}>
            <View style={styles.fileIconBox}>
              <Feather name="file-text" size={26} color="#00a86b" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                  : "File selected"}
              </Text>
            </View>

            <Ionicons name="checkmark-circle" size={24} color="#00a86b" />
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
          <InfoLine text="First Name, Middle Initial, Last Name" />
          <InfoLine text="Share Capital, Savings, Special Savings" />
          <InfoLine text="All loan type balances" />
          <InfoLine text="Total Loan Balance" />
          <InfoLine text="Member username or member ID" />
        </View>

        <View style={styles.noteBox}>
          <Feather name="info" size={18} color="#b45309" />
          <Text style={styles.noteText}>
            For now, this page prepares the UI. Backend CSV processing can be connected next.
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
  isDesktopWeb,
}) {
  return (
    <View>
      <View style={isDesktopWeb ? styles.manualGrid : null}>
        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>Member Information</Text>
          <Text style={styles.sectionSub}>Basic identity of the cooperative member</Text>

          <View style={isDesktopWeb ? styles.formGridThree : null}>
            <InputField
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateField("firstName", value)}
              placeholder="e.g. Maria"
            />

            <InputField
              label="Middle Initial"
              value={formData.middleInitial}
              onChangeText={(value) => updateField("middleInitial", value)}
              placeholder="e.g. C"
              maxLength={2}
            />

            <InputField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateField("lastName", value)}
              placeholder="e.g. Santos"
            />
          </View>
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>Savings Information</Text>
          <Text style={styles.sectionSub}>Savings, share capital, and special savings</Text>

          <View style={isDesktopWeb ? styles.formGridThree : null}>
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
          </View>
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Loan Balances</Text>
        <Text style={styles.sectionSub}>Encode all loan balances for this member</Text>

        <View style={isDesktopWeb ? styles.formGridFour : null}>
          <InputField
            label="Regular Loan"
            value={formData.regularLoan}
            onChangeText={(value) => updateField("regularLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Regular Loan - Diminishing"
            value={formData.regularLoanDiminishing}
            onChangeText={(value) => updateField("regularLoanDiminishing", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Educational Loan"
            value={formData.educationalLoan}
            onChangeText={(value) => updateField("educationalLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Educational Loan - Diminishing"
            value={formData.educationalLoanDiminishing}
            onChangeText={(value) => updateField("educationalLoanDiminishing", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Short-term Loan"
            value={formData.shortTermLoan}
            onChangeText={(value) => updateField("shortTermLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Short-term Loan - Diminishing"
            value={formData.shortTermLoanDiminishing}
            onChangeText={(value) => updateField("shortTermLoanDiminishing", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Appliance Loan"
            value={formData.applianceLoan}
            onChangeText={(value) => updateField("applianceLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Appliance Loan - Diminishing"
            value={formData.applianceLoanDiminishing}
            onChangeText={(value) => updateField("applianceLoanDiminishing", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Medical Loan"
            value={formData.medicalLoan}
            onChangeText={(value) => updateField("medicalLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Medical Loan - Diminishing"
            value={formData.medicalLoanDiminishing}
            onChangeText={(value) => updateField("medicalLoanDiminishing", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Petty Cash Loan"
            value={formData.pettyCashLoan}
            onChangeText={(value) => updateField("pettyCashLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Vehicle Loan"
            value={formData.vehicleLoan}
            onChangeText={(value) => updateField("vehicleLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <InputField
            label="Inter-Trading Loan"
            value={formData.interTradingLoan}
            onChangeText={(value) => updateField("interTradingLoan", value)}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={isDesktopWeb ? styles.actionGrid : null}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL LOAN BALANCE</Text>
          <Text style={styles.totalAmount}>₱{totalLoanBalance.toLocaleString()}.00</Text>
        </View>

        <View style={styles.actionPanel}>
          <TouchableOpacity style={styles.saveButton}>
            <Feather name="save" size={18} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Manual Record</Text>
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
        placeholderTextColor="#9caea6"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

function InfoLine({ text }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name="checkmark-circle-outline" size={17} color="#00a86b" />
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
    fontSize: Platform.OS === "web" ? 28 : 22,
    fontWeight: "900",
    marginTop: 6,
  },

  topSubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 5,
  },

  headerActions: {
    marginLeft: 16,
  },

  backButton: {
    height: 44,
    borderRadius: 13,
    backgroundColor: "#e6fff2",
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButtonText: {
    color: "#06472f",
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
    borderColor: "#e2f2eb",
    flexDirection: "row",
    marginBottom: 18,
  },

  modeTab: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#bdebd7",
    backgroundColor: "#f0fbf6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },

  modeTabActive: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#009060",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },

  modeText: {
    color: "#009060",
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

  uploadGrid: {
    flexDirection: "row",
    gap: 20,
  },

  uploadMainPanel: {
    flex: 1,
  },

  uploadSidePanel: {
    width: 380,
  },

  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2f2eb",
    marginBottom: 18,
  },

  uploadDropZone: {
    minHeight: 280,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#bdebd7",
    backgroundColor: "#f7fffb",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },

  uploadIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "#e6fff2",
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
    backgroundColor: "#009060",
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
    backgroundColor: "#f0fbf6",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#cfeee0",
  },

  fileIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#e6fff2",
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
    height: 50,
    borderRadius: 13,
    backgroundColor: "#009060",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 16,
  },

  uploadDisabled: {
    backgroundColor: "#9bcab8",
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
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginTop: 12,
  },

  noteText: {
    flex: 1,
    color: "#92400e",
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
  },

  manualGrid: {
    flexDirection: "row",
    gap: 20,
  },

  formGridThree: {
    flexDirection: "row",
    gap: 14,
  },

  formGridFour: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  inputGroup: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 210 : "100%",
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
    borderColor: "#bdebd7",
    backgroundColor: "#f0fbf6",
    paddingHorizontal: 14,
    color: "#052e1d",
    fontSize: 14,
  },

  actionGrid: {
    flexDirection: "row",
    gap: 20,
  },

  totalCard: {
    flex: 1,
    backgroundColor: "#06472f",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },

  totalLabel: {
    color: "#5ff0b1",
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
    backgroundColor: "#009060",
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
    borderColor: "#efb4a2",
    backgroundColor: "#fff8ef",
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