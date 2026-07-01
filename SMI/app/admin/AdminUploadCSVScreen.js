// app/admin/AdminUploadCSVScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

export default function AdminUploadCSVScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);

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

  return (
    <View style={styles.page}>
      <View style={styles.phone}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.time}>9:41</Text>
            <View style={styles.batteryWrap}>
              <View style={styles.battery} />
              <View style={styles.batterySmall} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/admin/AdminDashboardScreen")}
          >
            <Feather name="arrow-left" size={18} color="#ffffff" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Upload CSV File</Text>
          <Text style={styles.subtitle}>Import cooperative member records</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.uploadCard}>
            <View style={styles.uploadIcon}>
              <Feather name="upload-cloud" size={38} color="#00a86b" />
            </View>

            <Text style={styles.uploadTitle}>Select CSV or Excel File</Text>
            <Text style={styles.uploadSub}>
              Upload member records, savings, loans, dividends, or share capital data.
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
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </Text>
              </View>

              <Ionicons name="checkmark-circle" size={24} color="#00a86b" />
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Required CSV Columns</Text>

            <InfoLine text="Member ID" />
            <InfoLine text="Full Name" />
            <InfoLine text="Savings / Share Capital" />
            <InfoLine text="Loan Balance" />
            <InfoLine text="Dividend Amount" />
            <InfoLine text="Status" />
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, !selectedFile && styles.uploadDisabled]}
            disabled={!selectedFile}
          >
            <Feather name="upload" size={18} color="#ffffff" />
            <Text style={styles.uploadButtonText}>Upload and Process File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push("/admin/AdminDashboardScreen")}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

function InfoLine({ text }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name="checkmark-circle-outline" size={16} color="#00a86b" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#005033",
    alignItems: "center",
    justifyContent: "center",
  },

  phone: {
    width: 390,
    height: 844,
    backgroundColor: "#eafff4",
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2b7553",
  },

  header: {
    backgroundColor: "#06472f",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },

  batteryWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  battery: {
    width: 16,
    height: 9,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },

  batterySmall: {
    width: 3,
    height: 7,
    backgroundColor: "#ffffff",
    borderRadius: 1,
    marginLeft: 2,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  backText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },

  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 24,
  },

  subtitle: {
    color: "#5ff0b1",
    fontSize: 14,
    marginTop: 5,
  },

  content: {
    flex: 1,
    padding: 22,
  },

  uploadCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },

  uploadIcon: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "#e6fff2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  uploadTitle: {
    color: "#002c1d",
    fontSize: 18,
    fontWeight: "900",
  },

  uploadSub: {
    color: "#7f8790",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },

  chooseButton: {
    height: 44,
    borderRadius: 12,
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
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    color: "#002c1d",
    fontSize: 14,
    fontWeight: "900",
  },

  fileSize: {
    color: "#7f8790",
    fontSize: 11,
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },

  infoTitle: {
    color: "#002c1d",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },

  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoText: {
    color: "#344d41",
    fontSize: 13,
    marginLeft: 8,
  },

  uploadButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: "#009060",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
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

  cancelButton: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#efb4a2",
    backgroundColor: "#fff8ef",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#e23b3b",
    fontSize: 14,
    fontWeight: "900",
  },
});