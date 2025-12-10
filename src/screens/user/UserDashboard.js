import { ScrollView, Text, View, StyleSheet } from "react-native";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Header from "../../components/Header";
import Divider from "../../components/ui/Divider";
import SectionTitle from "../../components/ui/SectionTitle";
import ListTile from "../../components/ui/ListTile";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Chip from "../../components/ui/Chip";
import Switch from "../../components/ui/Switch";
import Avatar from "../../components/ui/Avatar";
import ImageCard from "../../components/ui/ImageCard";
import SearchBar from "../../components/ui/SearchBar";
import FormRow from "../../components/ui/FormRow";
import { colors, spacing, textSizes } from "../../theme";
import { Feather } from "@expo/vector-icons";

export default function UserDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>UI Component Showcase</Text>

      {/* Primary Button */}
      <Button title="Login" />

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

      <Card variant="default">
        <Text>djskjdk</Text>
      </Card>
      <Card variant="muted">
        <Text>djskjdk</Text>
      </Card>
      <Card variant="success">Deposit Completed</Card>
      <Card variant="danger">Payment Failed</Card>
      <Card variant="warning">Pending Confirmation</Card>
      <Card style={{ marginBottom: 16 }}>
        <Text>djskjdk</Text>
      </Card>
      <Card elevated={false}>
        <Text>djskjdk</Text>
      </Card>
      <Card style={{ margin: spacing.lg }}>
        <Text style={{ fontSize: textSizes.lg, marginBottom: spacing.sm }}>
          Payment Status
        </Text>
        <Text style={{ fontSize: textSizes.md, color: colors.textSecondary }}>
          Your deposit is confirmed!
        </Text>
      </Card>

      <Input label="Email" placeholder="Enter your email" />

      <Input label="Amount" placeholder="0.00" helper="Minimum ₹100" />

      <Input
        label="Email"
        placeholder="Enter email"
        error="Invalid email address"
      />

      <Card>
        <Input label="Full Name" placeholder="John Doe" />
      </Card>

      <Header
        title="Orders"
        right={
          <Feather name="more-vertical" size={20} color={colors.textPrimary} />
        }
      />

      <Header title="Wallet" shadow />

      <Divider inset={16} />

      <Divider thickness={2} />

      <Divider color={colors.gray300} />

      <Card>
        <Text>Subtotal</Text>
        <Divider />
        <Text>Total</Text>
      </Card>

      <Divider inset={20} />

      <Divider
        thickness={2}
        color={colors.gray200}
        style={{ marginVertical: 16 }}
      />

      <SectionTitle title="Order Summary" subtitle="Review the details below" />

      <SectionTitle
        title="Transactions"
        action={<Text style={{ color: colors.primary }}>See all</Text>}
      />

      <SectionTitle
        title="Products"
        titleStyle={{ fontSize: 22 }}
        style={{ marginTop: 20 }}
      />
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SectionTitle title="Address" />
        <Card>
          <Text>djskjdk</Text>
        </Card>

        <SectionTitle title="Payment Method" />
        <Card>
          <Text>djskjdk</Text>
        </Card>
      </View>

      <ListTile title="UPI Payment" subtitle="Linked to your bank" />

      <ListTile title="Total" right="₹1,299" />

      <ListTile title="Address" showArrow />

      <ListTile
        title="Orders"
        showArrow
        onPress={() => navigation.navigate("Orders")}
      />

      <Divider inset={40} />

      <Badge label="Delivered" variant="success" />

      <Badge label="Pending" variant="warning" />

      <Badge label="Cancelled" variant="danger" />

      <Badge label="New" variant="info" />

      <ListTile
        title="Order #12512"
        right={<Badge label="Delivered" variant="success" />}
      />

      <Card>
        <Badge label="Express Delivery" variant="info" />
      </Card>

      {/* <Modal visible={true} title="Added to Cart">
        <Text style={{ textAlign: "center", color: colors.textPrimary }}>
          Product added successfully!
        </Text>
      </Modal> */}

      {/* <Modal visible={true} title="Add Address" showButtons={false}>
        <Input label="Name" />
        <Input label="Phone" style={{ marginTop: 12 }} />
        <Button block style={{ marginTop: 20 }}>
          Save
        </Button>
      </Modal> */}

      <Chip label="Popular" />
      <Chip label="Newest" />
      <Chip label="Price Low" />

      <Chip
        label="Electronics"
        selected={true}
        onPress={() => setCategory("electronics")}
      />

      <Chip
        label="₹500 - ₹1000"
        rightIcon={<Text style={{ color: colors.textPrimary }}>×</Text>}
        onPress={() => removeFilter("price")}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Chip label="Shirts" />
        <Chip label="Pants" />
        <Chip label="Shoes" />
        <Chip label="Accessories" />
      </View>

      {/* <Switch value={isEnabled} onChange={setIsEnabled} />

      <Switch size="sm" value={notifications} onChange={setNotifications} /> */}

      {/* <ListTile
        title="Notifications"
        right={<Switch value={enabled} onChange={setEnabled} />}
      /> */}
      <Switch value={true} disabled />

      <Avatar name="John Doe" />

      <Avatar source="https://example.com/photo.png" />

      <Avatar size="lg" name="Amit Sharma" />
      <Avatar name="Rahul" status="online" />
      <Avatar name="Tejendra" onPress={() => navigation.navigate("Profile")} />
      <Avatar rounded={false} name="AB" />

      <ImageCard
        title="Men's Cotton T-Shirt"
        price={399}
        image="https://example.com/img1.png"
        discount={20}
        badge="HOT"
        onPress={() => navigation.navigate("ProductDetails")}
      />

      {/* <ImageCard
        title="Bluetooth Headphones"
        price={1299}
        image={product.image}
      /> */}

      <ImageCard
        title="Organic Almonds"
        price={249}
        image={
          "https://enjimxeifkptjueqapyz.supabase.co/storage/v1/object/public/shiv-mart/default.png"
        }
        showAddButton
      />

      {/* <SearchBar
        value={search}
        onChangeText={setSearch}
        style={{ margin: spacing.md }}
      /> */}

      <FormRow label="Full Name" required>
        <Input placeholder="Enter your name" />
      </FormRow>

      <FormRow label="Address Line 1">
        <Input placeholder="Street, House no." />
      </FormRow>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16, // Reduced margin for better spacing
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
