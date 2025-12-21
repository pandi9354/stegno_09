// src/screens/HomeScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Steganography</Text>
      <Text style={styles.subtitle}>Hide messages inside images</Text>

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
        <Text style={styles.cardDesc}>View encoded images stored in app</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f8fb" },
  title: { fontSize: 28, fontWeight: "800", marginTop: 20 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardDesc: { marginTop: 6, color: "#6b7280" },
});
