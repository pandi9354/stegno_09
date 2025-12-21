import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    console.log("==== SIGNUP STARTED ====");
    console.log("API URL:http://192.168.29.232:3002/signup");

    console.log("Sending data:", { email, password });

    try {
      console.log("→ Fetch request starting...");

      const response = await fetch("http://192.168.29.232:3002/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("→ Raw Response object:", response);

      const data = await response.json();
      console.log("→ Parsed JSON response:", data);

      alert(data.message);

      if (response.status === 200) {
        console.log("→ Signup success! Navigating back...");
        navigation.goBack();
      } else {
        console.log("→ Signup failed with status:", response.status);
      }

    } catch (error) {
      console.log("❌ ERROR OCCURRED:", error);
      alert("Error connecting to server: " + error.message);
    }

    console.log("==== SIGNUP END ====");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          console.log("Email entered:", text);
          setEmail(text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          console.log("Password entered:", text);
          setPassword(text);
        }}
      />

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log("→ Navigating back to Login screen");
          navigation.goBack();
        }}
      >
        <Text style={styles.login}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", justifyContent: "center", padding: 30 },
  title: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  signupBtn: { backgroundColor: "#20bf6b", padding: 15, borderRadius: 10, marginTop: 10 },
  signupText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" },
  login: { marginTop: 20, textAlign: "center", fontSize: 16, color: "#20bf6b" },
});

export default SignupScreen;
