import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Home</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.main}>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Welcome to the admin dashboard. Add widgets here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // bg-app
  },

  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { height: 2 },
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  main: {
    padding: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { height: 3 },
  },

  cardText: {
    color: "#666",
    fontSize: 16,
  },
});
