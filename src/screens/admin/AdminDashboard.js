import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Admin Home</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Welcome to the admin dashboard. Add widgets here.
        </Text>
      </View>
    </ScrollView>
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#F5F5F5",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 20,
  },

  cardText: {
    color: "#666",
    fontSize: 16,
  },
});
