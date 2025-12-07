import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Header({ title = "Home", showBack = false }) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Left */}
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Right */}
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFF",
    zIndex: 100,
  },

  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "#F2F2F2",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },

  searchButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "#F2F2F2",
  },
});
