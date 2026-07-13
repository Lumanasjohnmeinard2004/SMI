// components/CompanySelector.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const COMPANY_OPTIONS = [
  "Company 1",
  "Company 2",
  "Company 3",
  "Company 4",
];

export default function CompanySelector({
  label = "Company",
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const selectedValue = value || "Company 1";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.selectText}>
          {selectedValue}
        </Text>

        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#06472f"
        />
      </TouchableOpacity>

      {open ? (
        <View style={styles.optionsBox}>
          {COMPANY_OPTIONS.map((company) => {
            const active = company === selectedValue;

            return (
              <TouchableOpacity
                key={company}
                style={[
                  styles.optionButton,
                  active && styles.optionButtonActive,
                ]}
                onPress={() => {
                  onChange(company);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    active && styles.optionTextActive,
                  ]}
                >
                  {company}
                </Text>

                {active ? (
                  <Feather
                    name="check"
                    size={16}
                    color="#009060"
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 14,
    zIndex: 50,
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },

  selectButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d4a2",
    backgroundColor: "#fffdf5",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    color: "#052e1d",
    fontSize: 14,
    fontWeight: "700",
  },

  optionsBox: {
    marginTop: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d4a2",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  optionButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3ead0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionButtonActive: {
    backgroundColor: "#e6fff2",
  },

  optionText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  optionTextActive: {
    color: "#009060",
    fontWeight: "900",
  },
});