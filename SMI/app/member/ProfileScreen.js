// app/member/ProfileScreen.js

 

import React, { useEffect, useState } from "react";

import {

  View,

  Text,

  StyleSheet,

  TouchableOpacity,

  ActivityIndicator,

  Platform,

  Alert,

} from "react-native";

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import {

  MemberScreen,

  SectionCard,

  InfoRow,

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

 

function formatCurrencyPlain(value) {

  const numberValue = Number(value || 0);

 

  return `PHP ${numberValue.toLocaleString("en-PH", {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  })}`;

}

 

function escapeHtml(value) {

  return String(value ?? "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}

 

function formatDate(value) {

  if (!value) {

    return "Not set";

  }

 

  const date = new Date(value);

 

  if (Number.isNaN(date.getTime())) {

    return String(value);

  }

 

  return date.toLocaleDateString("en-PH", {

    year: "numeric",

    month: "long",

    day: "2-digit",

  });

}

 

function initialsFromName(name) {

  if (!name) {

    return "MB";

  }

 

  const words = String(name).trim().split(" ").filter(Boolean);

 

  if (words.length === 0) {

    return "MB";

  }

 

  if (words.length === 1) {

    return words[0].slice(0, 2).toUpperCase();

  }

 

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();

}

 

function getTotalSavings(member) {

  return (

    Number(member.share_capital || 0) +

    Number(member.savings || 0) +

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

 

const LOAN_FIELDS = [

  ["Regular Loan", "regular_loan", "regular_loan_due_date"],

  ["Regular Loan - Diminishing", "regular_loan_diminishing", "regular_loan_diminishing_due_date"],

  ["Educational Loan", "educational_loan", "educational_loan_due_date"],

  ["Educational Loan - Diminishing", "educational_loan_diminishing", "educational_loan_diminishing_due_date"],

  ["Short-term Loan", "short_term_loan", "short_term_loan_due_date"],

  ["Short-term Loan - Diminishing", "short_term_loan_diminishing", "short_term_loan_diminishing_due_date"],

  ["Appliance Loan", "appliance_loan", "appliance_loan_due_date"],

  ["Appliance Loan - Diminishing", "appliance_loan_diminishing", "appliance_loan_diminishing_due_date"],

  ["Medical Loan", "medical_loan", "medical_loan_due_date"],

  ["Medical Loan - Diminishing", "medical_loan_diminishing", "medical_loan_diminishing_due_date"],

  ["Petty Cash Loan", "petty_cash_loan", "petty_cash_loan_due_date"],

  ["Vehicle Loan", "vehicle_loan", "vehicle_loan_due_date"],

  ["Inter-Trading Loan", "inter_trading_loan", "inter_trading_loan_due_date"],

];

 

function getActiveLoans(member) {

  return LOAN_FIELDS.map(([label, balanceField, dueDateField]) => ({

    label,

    balance: Number(member[balanceField] || 0),

    dueDate: member[dueDateField] || "",

  })).filter((loan) => loan.balance > 0);

}

 

function buildReportHtml(member, monthlyRecords) {

  const totalSavings = getTotalSavings(member);

  const totalLoan = getTotalLoan(member);

  const activeLoans = getActiveLoans(member);

  const reportDate = new Date().toLocaleDateString("en-PH", {

    year: "numeric",

    month: "long",

    day: "2-digit",

  });

 

  const loanRows =

    activeLoans.length > 0

      ? activeLoans

          .map(

            (loan) => `

              <tr>

                <td>${escapeHtml(loan.label)}</td>

                <td class="money">${formatCurrencyPlain(loan.balance)}</td>

                <td>${escapeHtml(formatDate(loan.dueDate))}</td>

                <td><span class="pill">Active</span></td>

              </tr>

            `

          )

          .join("")

      : `

          <tr>

            <td colspan="4" class="empty">No active loan balance.</td>

          </tr>

        `;

 

  const monthlyRows =

    monthlyRecords.length > 0

      ? monthlyRecords

          .slice(0, 12)

          .map((record) => {

            const monthSavings =

              Number(record.share_capital || 0) +

              Number(record.savings || 0) +

              Number(record.special_savings || 0);

 

            const monthLoans = getTotalLoan(record);

 

            return `

              <tr>

                <td>${escapeHtml(record.record_month || record.month || "Not set")}</td>

                <td class="money">${formatCurrencyPlain(monthSavings)}</td>

                <td class="money">${formatCurrencyPlain(monthLoans)}</td>

                <td class="money">${formatCurrencyPlain(record.dividend_amount || 0)}</td>

              </tr>

            `;

          })

          .join("")

      : `

          <tr>

            <td colspan="4" class="empty">No monthly records available.</td>

          </tr>

        `;

 

  return `

<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <style>

    @page {

      size: A4;

      margin: 18mm;

    }

 

    * {

      box-sizing: border-box;

    }

 

    body {

      margin: 0;

      font-family: Arial, Helvetica, sans-serif;

      color: #173526;

      background: #ffffff;

      font-size: 11px;

    }

 

    .report {

      width: 100%;

    }

 

    .header {

      border-bottom: 3px solid #0b5f3a;

      padding-bottom: 14px;

      margin-bottom: 16px;

      display: flex;

      justify-content: space-between;

      align-items: flex-start;

    }

 

    .brand {

      color: #0b5f3a;

      font-size: 28px;

      font-weight: 800;

      margin: 0;

    }

 

    .subtitle {

      color: #b28a1d;

      font-size: 14px;

      font-weight: 700;

      margin-top: 5px;

    }

 

    .report-date {

      text-align: right;

      color: #52675c;

      line-height: 1.5;

    }

 

    .profile-card {

      border: 1px solid #b9cbbb;

      border-radius: 12px;

      padding: 16px;

      margin-bottom: 18px;

      display: grid;

      grid-template-columns: 1fr 1fr 1fr;

      gap: 12px;

      background: #fbfdfb;

    }

 

    .profile-name {

      font-size: 20px;

      font-weight: 800;

      color: #0b5f3a;

      margin-bottom: 7px;

    }

 

    .label {

      color: #687a70;

      font-size: 9px;

      text-transform: uppercase;

      font-weight: 700;

      margin-bottom: 3px;

    }

 

    .value {

      color: #173526;

      font-weight: 700;

      margin-bottom: 9px;

    }

 

    .pill {

      display: inline-block;

      padding: 4px 10px;

      border-radius: 10px;

      border: 1px solid #8fc39f;

      background: #e8f8ed;

      color: #17653a;

      font-size: 9px;

      font-weight: 800;

    }

 

    .summary-grid {

      display: grid;

      grid-template-columns: repeat(4, 1fr);

      gap: 10px;

      margin-bottom: 18px;

    }

 

    .summary-card {

      border: 1px solid #d6dfd7;

      border-radius: 10px;

      padding: 12px;

      background: #ffffff;

    }

 

    .summary-title {

      color: #687a70;

      font-size: 9px;

      font-weight: 700;

      text-transform: uppercase;

    }

 

    .summary-value {

      margin-top: 7px;

      color: #0b5f3a;

      font-size: 15px;

      font-weight: 800;

    }

 

    .section {

      margin-bottom: 18px;

      page-break-inside: avoid;

    }

 

    .section-title {

      background: #0b5f3a;

      color: #ffffff;

      padding: 8px 10px;

      font-size: 12px;

      font-weight: 800;

      border-radius: 6px 6px 0 0;

    }

 

    table {

      width: 100%;

      border-collapse: collapse;

    }

 

    th {

      background: #edf5ef;

      color: #173526;

      text-align: left;

      padding: 8px;

      border: 1px solid #d4dfd6;

      font-size: 9px;

    }

 

    td {

      padding: 8px;

      border: 1px solid #d4dfd6;

      vertical-align: top;

    }

 

    .money {

      text-align: right;

      font-weight: 700;

    }

 

    .total-row td {

      background: #f5faf6;

      color: #0b5f3a;

      font-weight: 800;

    }

 

    .empty {

      text-align: center;

      color: #7c8b82;

      padding: 14px;

    }

 

    .footer {

      margin-top: 22px;

      padding-top: 10px;

      border-top: 2px solid #0b5f3a;

      color: #687a70;

      font-size: 9px;

      display: flex;

      justify-content: space-between;

    }

  </style>

</head>

 

<body>

  <div class="report">

    <div class="header">

      <div>

        <h1 class="brand">SMI Coop Member Statistics Report</h1>

        <div class="subtitle">Member Financial and Account Summary</div>

      </div>

 

      <div class="report-date">

        <strong>Report Date</strong><br />

        ${escapeHtml(reportDate)}

      </div>

    </div>

 

    <div class="profile-card">

      <div>

        <div class="profile-name">${escapeHtml(member.full_name || "Member")}</div>

        <div class="label">Member ID</div>

        <div class="value">${escapeHtml(member.member_id || "Not set")}</div>

        <div class="label">Username</div>

        <div class="value">${escapeHtml(member.username || "Not set")}</div>

      </div>

 

      <div>

        <div class="label">Company</div>

        <div class="value">${escapeHtml(member.company || "Company not assigned")}</div>

        <div class="label">Membership Status</div>

        <div class="value"><span class="pill">${escapeHtml(member.status || "Active")}</span></div>

        <div class="label">Member Since</div>

        <div class="value">${escapeHtml(formatDate(member.created_at || member.member_since))}</div>

      </div>

 

      <div>

        <div class="label">Email</div>

        <div class="value">${escapeHtml(member.email || "Not set")}</div>

        <div class="label">Phone</div>

        <div class="value">${escapeHtml(member.phone || member.contact_number || "Not set")}</div>

        <div class="label">Address</div>

        <div class="value">${escapeHtml(member.address || "Not set")}</div>

      </div>

    </div>

 

    <div class="summary-grid">

      <div class="summary-card">

        <div class="summary-title">Total Savings</div>

        <div class="summary-value">${formatCurrencyPlain(totalSavings)}</div>

      </div>

 

      <div class="summary-card">

        <div class="summary-title">Total Loan Balance</div>

        <div class="summary-value">${formatCurrencyPlain(totalLoan)}</div>

      </div>

 

      <div class="summary-card">

        <div class="summary-title">Dividend Amount</div>

        <div class="summary-value">${formatCurrencyPlain(member.dividend_amount || 0)}</div>

      </div>

 

      <div class="summary-card">

        <div class="summary-title">Active Loans</div>

        <div class="summary-value">${activeLoans.length}</div>

      </div>

    </div>

 

    <div class="section">

      <div class="section-title">Savings and Capital Breakdown</div>

      <table>

        <thead>

          <tr>

            <th>Description</th>

            <th style="text-align:right;">Current Balance</th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td>Share Capital</td>

            <td class="money">${formatCurrencyPlain(member.share_capital || 0)}</td>

          </tr>

          <tr>

            <td>Savings</td>

            <td class="money">${formatCurrencyPlain(member.savings || 0)}</td>

          </tr>

          <tr>

            <td>Special Savings</td>

            <td class="money">${formatCurrencyPlain(member.special_savings || 0)}</td>

          </tr>

          <tr class="total-row">

            <td>Total Savings</td>

            <td class="money">${formatCurrencyPlain(totalSavings)}</td>

          </tr>

        </tbody>

      </table>

    </div>

 

    <div class="section">

      <div class="section-title">Loan Statistics</div>

      <table>

        <thead>

          <tr>

            <th>Loan Type</th>

            <th style="text-align:right;">Current Balance</th>

            <th>Due Date</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          ${loanRows}

          <tr class="total-row">

            <td>Total Loan Balance</td>

            <td class="money">${formatCurrencyPlain(totalLoan)}</td>

            <td>-</td>

            <td>-</td>

          </tr>

        </tbody>

      </table>

    </div>

 

    <div class="section">

      <div class="section-title">Monthly Financial Statistics</div>

      <table>

        <thead>

          <tr>

            <th>Record Month</th>

            <th style="text-align:right;">Total Savings</th>

            <th style="text-align:right;">Total Loans</th>

            <th style="text-align:right;">Dividend</th>

          </tr>

        </thead>

        <tbody>

          ${monthlyRows}

        </tbody>

      </table>

    </div>

 

    <div class="footer">

      <div>This report is system-generated and confidential.</div>

      <div>SMI Coop Management</div>

    </div>

  </div>

</body>

</html>

  `;

}

 

export default function ProfileScreen() {

  const router = useRouter();

  const params = useLocalSearchParams();

 

  const identifier =

    params.member_id || params.username || params.id || params.userId || "msantos";

 

  const [member, setMember] = useState(null);

  const [monthlyRecords, setMonthlyRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [printing, setPrinting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

 

  useEffect(() => {

    loadProfile();

  }, [identifier]);

 

  async function loadProfile() {

    try {

      setLoading(true);

      setErrorMessage("");

 

      const data = await apiRequest(

        `/members/${encodeURIComponent(identifier)}/financials`,

        "GET"

      );

 

      let mergedMember = data.member;

 

      try {

        const companyData = await apiRequest(

          `/members/${encodeURIComponent(identifier)}/company`,

          "GET"

        );

 

        if (companyData?.member) {

          mergedMember = {

            ...mergedMember,

            ...companyData.member,

          };

        }

      } catch (companyError) {

        // Keep the financial data even when the company endpoint is unavailable.

      }

 

      setMember(mergedMember);

 

      try {

        const monthlyData = await apiRequest(

          `/members/${encodeURIComponent(identifier)}/monthly-financials`,

          "GET"

        );

 

        const records =

          monthlyData.records ||

          monthlyData.monthly_records ||

          monthlyData.financials ||

          monthlyData.data ||

          [];

 

        setMonthlyRecords(Array.isArray(records) ? records : []);

      } catch (monthlyError) {

        setMonthlyRecords([]);

      }

    } catch (error) {

      setErrorMessage(error.message || "Failed to load profile.");

    } finally {

      setLoading(false);

    }

  }

 

  function openTransactionHistory() {

    router.push({

      pathname: "/member/TransactionHistoryScreen",

      params: {

        member_id: member?.member_id || identifier,

        username: member?.username || identifier,

        memberName: member?.full_name || "Member",

      },

    });

  }

 

  async function printMemberStatistics() {

    if (!member || printing) {

      return;

    }

 

    try {

      setPrinting(true);

 

      const html = buildReportHtml(member, monthlyRecords);

 

      if (Platform.OS === "web") {

        const printFrame = document.createElement("iframe");

 

        printFrame.style.position = "fixed";

        printFrame.style.right = "0";

        printFrame.style.bottom = "0";

        printFrame.style.width = "0";

        printFrame.style.height = "0";

        printFrame.style.border = "0";

        printFrame.style.visibility = "hidden";

 

        document.body.appendChild(printFrame);

 

        const frameDocument =

          printFrame.contentDocument || printFrame.contentWindow?.document;

 

        if (!frameDocument || !printFrame.contentWindow) {

          printFrame.remove();

          throw new Error("Unable to prepare the report for printing.");

        }

 

        frameDocument.open();

        frameDocument.write(html);

        frameDocument.close();

 

        const cleanupFrame = () => {

          setTimeout(() => {

            if (printFrame.parentNode) {

              printFrame.parentNode.removeChild(printFrame);

            }

          }, 500);

        };

 

        printFrame.onload = () => {

          setTimeout(() => {

            printFrame.contentWindow.focus();

            printFrame.contentWindow.print();

          }, 400);

        };

 

        printFrame.contentWindow.onafterprint = cleanupFrame;

 

        setTimeout(() => {

          if (printFrame.contentWindow) {

            printFrame.contentWindow.focus();

            printFrame.contentWindow.print();

          }

        }, 900);

 

        return;

      }

 

      const result = await Print.printToFileAsync({

        html,

        base64: false,

      });

 

      const sharingAvailable = await Sharing.isAvailableAsync();

 

      if (sharingAvailable) {

        await Sharing.shareAsync(result.uri, {

          mimeType: "application/pdf",

          dialogTitle: "Save or share member statistics report",

          UTI: "com.adobe.pdf",

        });

      } else {

        Alert.alert(

          "PDF Created",

          `The report was created at:\n${result.uri}`

        );

      }

    } catch (error) {

      Alert.alert(

        "Unable to Create PDF",

        error.message || "The member statistics report could not be created."

      );

    } finally {

      setPrinting(false);

    }

  }

 

  if (loading) {

    return (

      <MemberScreen

        active="Profile"

        title="My Profile"

        subtitle="Member account information."

      >

        <SectionCard title="Loading">

          <View style={styles.centerBox}>

            <ActivityIndicator color={theme.green} />

            <Text style={styles.loadingText}>Loading profile...</Text>

          </View>

        </SectionCard>

      </MemberScreen>

    );

  }

 

  if (errorMessage || !member) {

    return (

      <MemberScreen

        active="Profile"

        title="My Profile"

        subtitle="Member account information."

      >

        <SectionCard title="Unable to Load Profile">

          <Text style={styles.errorText}>{errorMessage}</Text>

 

          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>

            <Text style={styles.retryButtonText}>Try Again</Text>

          </TouchableOpacity>

        </SectionCard>

      </MemberScreen>

    );

  }

 

  const totalLoan = getTotalLoan(member);

 

  return (

    <MemberScreen

      active="Profile"

      title="My Profile"

      subtitle="Member account information."

    >

      <View style={styles.profileHero}>

        <View style={styles.bigAvatar}>

          <Text style={styles.bigAvatarText}>

            {initialsFromName(member.full_name)}

          </Text>

        </View>

 

        <View style={styles.profileInfo}>

          <Text style={styles.memberName}>{member.full_name}</Text>

          <Text style={styles.memberCode}>{member.member_id}</Text>

 

          <View style={styles.statusWrap}>

            <StatusBadge text={`${member.status || "Active"} Member`} />

          </View>

        </View>

      </View>

 

      <TouchableOpacity

        style={styles.printButton}

        onPress={printMemberStatistics}

        disabled={printing}

      >

        {printing ? (

          <ActivityIndicator color="#ffffff" />

        ) : (

          <>

            <Feather name="printer" size={18} color="#ffffff" />

            <Text style={styles.printButtonText}>

              Print Member Statistics PDF

            </Text>

          </>

        )}

      </TouchableOpacity>

 

      <SectionCard title="Account Information">

        <InfoRow label="Full Name" value={member.full_name} />

        <InfoRow label="Member ID" value={member.member_id} />

        <InfoRow label="Username" value={member.username} />

        <InfoRow label="Company" value={member.company || "Company not assigned"} />

        <InfoRow label="Role" value="Normal Member" />

        <InfoRow label="Membership Status" value={member.status || "Active"} />

        <InfoRow

          label="Member Since"

          value={formatDate(member.created_at || member.member_since)}

        />

      </SectionCard>

 

      <SectionCard title="Contact Information">

        <InfoRow label="Email" value={member.email || "Not set"} />

        <InfoRow

          label="Phone Number"

          value={member.phone || member.contact_number || "Not set"}

        />

        <InfoRow label="Address" value={member.address || "Not set"} />

        <InfoRow label="Branch" value={member.branch || "Main Branch"} />

      </SectionCard>

 

      <SectionCard title="Cooperative Details">

        <InfoRow

          label="Cooperative"

          value="Savings Mutual Intercompany Multipurpose Co-op"

        />

        <InfoRow label="Share Capital" value={formatCurrency(member.share_capital)} />

        <InfoRow label="Savings" value={formatCurrency(member.savings)} />

        <InfoRow

          label="Special Savings"

          value={formatCurrency(member.special_savings)}

        />

        <InfoRow label="Current Loan Balance" value={formatCurrency(totalLoan)} />

        <InfoRow

          label="Total Dividends Earned"

          value={formatCurrency(member.dividend_amount)}

        />

      </SectionCard>

 

      <SectionCard title="Settings">

        <SettingRow

          icon={

            <MaterialCommunityIcons

              name="clipboard-text-clock-outline"

              size={20}

              color={theme.muted}

            />

          }

          label="Transaction History"

          onPress={openTransactionHistory}

        />

 

        <SettingRow

          icon={<Ionicons name="moon-outline" size={20} color={theme.muted} />}

          label="Dark Mode"

          value="Off"

        />

 

        <SettingRow

          icon={<Feather name="lock" size={20} color={theme.muted} />}

          label="Security & Privacy"

        />

 

        <SettingRow

          icon={<Feather name="help-circle" size={20} color={theme.muted} />}

          label="Help & Support"

        />

      </SectionCard>

 

      <TouchableOpacity

        style={styles.signOutButton}

        onPress={() => router.replace("/")}

      >

        <Feather name="log-out" size={18} color="#ffffff" />

        <Text style={styles.signOutText}>Sign Out</Text>

      </TouchableOpacity>

    </MemberScreen>

  );

}

 

function SettingRow({ icon, label, value, onPress }) {

  return (

    <TouchableOpacity

      style={styles.settingRow}

      activeOpacity={onPress ? 0.75 : 1}

      onPress={onPress}

    >

      <View style={styles.settingLeft}>

        {icon}

        <Text style={styles.settingText}>{label}</Text>

      </View>

 

      {value ? (

        <Text style={styles.settingValue}>{value}</Text>

      ) : (

        <Feather name="chevron-right" size={20} color={theme.muted} />

      )}

    </TouchableOpacity>

  );

}

 

const styles = StyleSheet.create({

  profileHero: {

    backgroundColor: theme.greenDark,

    borderRadius: 20,

    padding: 20,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 16,

    borderWidth: 1,

    borderColor: theme.gold,

  },

 

  bigAvatar: {

    width: 76,

    height: 76,

    borderRadius: 38,

    backgroundColor: "rgba(200,155,44,0.16)",

    borderWidth: 1,

    borderColor: "rgba(200,155,44,0.35)",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 16,

  },

 

  bigAvatarText: {

    color: theme.gold,

    fontSize: 24,

    fontWeight: "900",

  },

 

  profileInfo: {

    flex: 1,

  },

 

  memberName: {

    color: "#ffffff",

    fontSize: 23,

    fontWeight: "900",

  },

 

  memberCode: {

    color: "#d7e8dc",

    fontSize: 12,

    marginTop: 5,

  },

 

  statusWrap: {

    marginTop: 12,

    alignSelf: "flex-start",

  },

 

  printButton: {

    height: 50,

    backgroundColor: theme.gold,

    borderRadius: 16,

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

    marginBottom: 16,

  },

 

  printButtonText: {

    color: "#ffffff",

    fontSize: 14,

    fontWeight: "900",

    marginLeft: 8,

  },

 

  settingRow: {

    borderTopWidth: 1,

    borderTopColor: "#eadfca",

    paddingVertical: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

 

  settingLeft: {

    flexDirection: "row",

    alignItems: "center",

    flex: 1,

  },

 

  settingText: {

    color: theme.muted,

    fontSize: 14,

    marginLeft: 12,

    fontWeight: "700",

  },

 

  settingValue: {

    color: theme.greenDark,

    fontSize: 13,

    fontWeight: "900",

  },

 

  signOutButton: {

    height: 50,

    backgroundColor: theme.green,

    borderRadius: 16,

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

    marginBottom: 16,

  },

 

  signOutText: {

    color: "#ffffff",

    fontSize: 15,

    fontWeight: "900",

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

});