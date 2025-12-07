import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Header({ title = "Home", showBack = true }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Left Section */}
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#555" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right Section */}
      <TouchableOpacity style={styles.searchButton}>
        <Feather name="search" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    textTransform: "capitalize",
  },

  searchButton: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 30,
  },
});
