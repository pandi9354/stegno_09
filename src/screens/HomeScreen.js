// src/screens/HomeScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => navigation.replace("Login"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Steganography</Text>
          <Text style={styles.subtitle}>Hide messages inside images</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Encode")}
      >
        <Text style={styles.cardTitle}>Encode</Text>
        <Text style={styles.cardDesc}>Hide secret text in an image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Decode")}
      >
        <Text style={styles.cardTitle}>Decode</Text>
        <Text style={styles.cardDesc}>Reveal hidden messages</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#eef7ff" }]}
        onPress={() => navigation.navigate("SavedFiles")}
      >
        <Text style={styles.cardTitle}>Saved Images</Text>
        <Text style={styles.cardDesc}>
          View encoded images stored in app
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f8fb" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardDesc: { marginTop: 6, color: "#6b7280" },
});
