import { ScrollView, Text, View, StyleSheet } from "react-native";
import Button from "../../components/Button/Button";

export default function UserDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>UI Component Showcase</Text>

      {/* Primary Button */}
      <Button style={{ backgroundColor: "#2563EB", marginBottom: 12 }}>
        Continue
      </Button>

      {/* Blue tinted info box */}
      <View style={styles.infoBlue}>
        <Text style={styles.infoBlueText}>Blue tinted info box</Text>
      </View>

      <Button variant="link" style={{ marginBottom: 12 }}>
        View Transactions
      </Button>
      <Text style={styles.successText}>Deposit Successful</Text>

      <View style={styles.discountTag}>
        <Text style={styles.discountText}>20% OFF</Text>
      </View>

      <View style={styles.verifiedBox}>
        <Text style={styles.verifiedText}>Verified</Text>
      </View>

      <View style={styles.offerTag}>
        <Text style={styles.offerText}>Limited Time Offer</Text>
      </View>

      <Text style={styles.offerStrong}>Only 3 left!</Text>

      <Button
        variant="secondary"
        style={{ borderColor: "#EA580C", marginBottom: 12 }}
        textStyle={{ color: "#EA580C" }}
      >
        View Deal
      </Button>

      <Text style={styles.errorText}>Payment failed. Try again.</Text>

      <View style={styles.errorBox}>
        <Text style={styles.errorBoxText}>Something went wrong</Text>
      </View>

      <Button
        variant="secondary"
        style={{ borderColor: "#DC2626", marginBottom: 12 }}
        textStyle={{ color: "#DC2626" }}
      >
        Delete Item
      </Button>

      {/* Success Button */}
      <Button style={{ backgroundColor: "#16A34A", marginBottom: 12 }}>
        Verified
      </Button>

      {/* Danger Button */}
      <Button style={{ backgroundColor: "#DC2626", marginBottom: 12 }}>
        Delete
      </Button>

      {/* Warning Button */}
      <Button style={{ backgroundColor: "#F59E0B", marginBottom: 12 }}>
        Claim Offer
      </Button>

      {/* Dark Button */}
      <Button variant="default" style={{ marginBottom: 12 }}>
        Continue
      </Button>

      {/* Primary Gradient Box (simplified) */}
      <View style={styles.gradientSoft}>
        <Text>Deposit Confirmed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },

  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },

  infoBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoBlueText: {
    color: "#1E40AF",
  },

  successText: {
    color: "#16A34A",
    marginBottom: 12,
  },

  discountTag: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  discountText: {
    color: "#065F46",
  },

  verifiedBox: {
    borderWidth: 1,
    borderColor: "#6EE7B7",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedText: {
    color: "#10B981",
  },

  offerTag: {
    backgroundColor: "#FFEDD5",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  offerText: {
    color: "#C2410C",
  },
  offerStrong: {
    color: "#C2410C",
    fontWeight: "600",
    marginBottom: 12,
  },

  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorBoxText: {
    color: "#DC2626",
  },

  gradientSoft: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
});
