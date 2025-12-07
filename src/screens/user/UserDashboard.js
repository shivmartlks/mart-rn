// import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

// export default function UserDashboard() {
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>Simple Home P</Text>

//       {/* Primary Button */}
//       <Pressable style={styles.primaryButton}>
//         <Text style={styles.primaryButtonText}>Continue</Text>
//       </Pressable>

//       {/* Blue tinted info box */}
//       <View style={styles.infoBlue}>
//         <Text style={styles.infoBlueText}>Blue tinted info box</Text>
//       </View>

//       <Text style={styles.linkBlue}>View Transactions</Text>
//       <Text style={styles.successText}>Deposit Successful</Text>

//       <View style={styles.discountTag}>
//         <Text style={styles.discountText}>20% OFF</Text>
//       </View>

//       <View style={styles.verifiedBox}>
//         <Text style={styles.verifiedText}>Verified</Text>
//       </View>

//       <View style={styles.offerTag}>
//         <Text style={styles.offerText}>Limited Time Offer</Text>
//       </View>

//       <Text style={styles.offerStrong}>Only 3 left!</Text>

//       <Pressable style={styles.outlineOrange}>
//         <Text style={styles.outlineOrangeText}>View Deal</Text>
//       </Pressable>

//       <Text style={styles.errorText}>Payment failed. Try again.</Text>

//       <View style={styles.errorBox}>
//         <Text style={styles.errorBoxText}>Something went wrong</Text>
//       </View>

//       <Pressable style={styles.outlineRed}>
//         <Text style={styles.outlineRedText}>Delete Item</Text>
//       </Pressable>

//       {/* Success Button */}
//       <Pressable style={styles.successButton}>
//         <Text style={styles.successButtonText}>Verified</Text>
//       </Pressable>

//       {/* Danger Button */}
//       <Pressable style={styles.dangerButton}>
//         <Text style={styles.dangerButtonText}>Delete</Text>
//       </Pressable>

//       {/* Warning Button */}
//       <Pressable style={styles.warningButton}>
//         <Text style={styles.warningButtonText}>Claim Offer</Text>
//       </Pressable>

//       {/* Dark Button */}
//       <Pressable style={styles.darkButton}>
//         <Text style={styles.darkButtonText}>Continue</Text>
//       </Pressable>

//       {/* Primary Gradient Box (simplified) */}
//       <View style={styles.gradientSoft}>
//         <Text>Deposit Confirmed</Text>
//       </View>
//     </ScrollView>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#F5F5F5",
//   },

//   heading: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 20,
//   },

//   primaryButton: {
//     backgroundColor: "#2563EB",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   primaryButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },

//   infoBlue: {
//     backgroundColor: "#EFF6FF",
//     borderColor: "#BFDBFE",
//     borderWidth: 1,
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   infoBlueText: {
//     color: "#1E40AF",
//   },

//   linkBlue: {
//     color: "#2563EB",
//     fontWeight: "500",
//     marginBottom: 12,
//   },

//   successText: {
//     color: "#16A34A",
//     marginBottom: 12,
//   },

//   discountTag: {
//     backgroundColor: "#ECFDF5",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     marginBottom: 12,
//   },
//   discountText: {
//     color: "#065F46",
//   },

//   verifiedBox: {
//     borderWidth: 1,
//     borderColor: "#6EE7B7",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   verifiedText: {
//     color: "#10B981",
//   },

//   offerTag: {
//     backgroundColor: "#FFEDD5",
//     padding: 8,
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     marginBottom: 12,
//   },
//   offerText: {
//     color: "#C2410C",
//   },
//   offerStrong: {
//     color: "#C2410C",
//     fontWeight: "600",
//     marginBottom: 12,
//   },

//   outlineOrange: {
//     borderWidth: 1,
//     borderColor: "#EA580C",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   outlineOrangeText: {
//     color: "#EA580C",
//   },

//   errorText: {
//     color: "#DC2626",
//     marginBottom: 12,
//   },
//   errorBox: {
//     backgroundColor: "#FEF2F2",
//     borderColor: "#FECACA",
//     padding: 12,
//     borderWidth: 1,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   errorBoxText: {
//     color: "#DC2626",
//   },

//   outlineRed: {
//     borderWidth: 1,
//     borderColor: "#DC2626",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   outlineRedText: {
//     color: "#DC2626",
//   },

//   successButton: {
//     backgroundColor: "#16A34A",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   successButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },

//   dangerButton: {
//     backgroundColor: "#DC2626",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   dangerButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },

//   warningButton: {
//     backgroundColor: "#F59E0B",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   warningButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },

//   darkButton: {
//     backgroundColor: "#0A0A0A",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   darkButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },

//   gradientSoft: {
//     backgroundColor: "#F3F4F6",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 20,
//   },
// });

import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";

export default function UserDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Simple Home Page</Text>

      {/* Your UI components */}
      {/* ...no changes needed */}
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
});
