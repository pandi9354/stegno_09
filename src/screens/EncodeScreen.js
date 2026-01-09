// src/screens/EncodeScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";


import { PermissionsAndroid } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import { encodeEncryptedMessage } from "../utils/lsb";
import { addSavedFile } from "../utils/savedFiles";
import { useNavigation } from "@react-navigation/native";

/* ------------------------------------------------------ */
async function hasAndroidPermission() {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 33) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ]);

    return (
      result["android.permission.READ_MEDIA_IMAGES"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result["android.permission.READ_MEDIA_VIDEO"] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
}

/* ------------------------------------------------------ */
export default function EncodeScreen() {
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [encodedBase64, setEncodedBase64] = useState(null);
  const [aesKey, setAesKey] = useState(""); // start empty


  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: false, quality: 1 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Picker error", response.errorMessage || "Unknown");
          return;
        }

        const asset = response.assets[0];

        setSelectedImage({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });

        setEncodedBase64(null);
      }
    );
  };

  async function ensurePngBase64(asset) {
    let uri = asset.uri;

    const isPNG =
      asset.type === "image/png" ||
      (asset.fileName && asset.fileName.toLowerCase().endsWith(".png"));

    if (!isPNG) {
      const converted = await ImageResizer.createResizedImage(
        uri,
        1200,
        1200,
        "PNG",
        100,
        0
      );
      uri = converted.uri;
    }

    const path = uri.startsWith("file://") ? uri.replace("file://", "") : uri;
    const base64 = await RNFS.readFile(path, "base64");
    return base64;
  }

  const encodeNow = async () => {
    if (!selectedImage) {
      Alert.alert("Select Image", "Please pick an image first.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Enter message", "Please enter a secret message.");
      return;
    }
    if (!aesKey.trim()) {
      Alert.alert("AES Key Required", "Please enter a secret key.");
      return;
    }


    try {
      const base64Png = await ensurePngBase64(selectedImage);

      const outBase64 = encodeEncryptedMessage(base64Png, message, aesKey);

      setEncodedBase64(outBase64);
      Alert.alert("Success", "Message encoded.");
    } catch (err) {
      Alert.alert("Encoding error", err.message);
    }
  };

  const saveToAppFolder = async () => {
    if (!encodedBase64) {
      Alert.alert("No encoded image", "Encode an image first.");
      return;
    }

    try {
      // Private app folder
      const filename = `stego_${Date.now()}.png`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      await RNFS.writeFile(filePath, encodedBase64, "base64");

      // Save metadata
      await addSavedFile({
        filename,
        path: filePath,
        createdAt: Date.now(),
      });

      Alert.alert("Saved", "Image stored inside app.");

    } catch (err) {
      Alert.alert("Save error", err.message);
    }
  };

 return (
  <View style={styles.container}>
    <Text style={styles.title}>Encode Message</Text>

    <TouchableOpacity style={styles.btn} onPress={pickImage}>
      <Text style={styles.btnText}>Pick Image</Text>
    </TouchableOpacity>

    {selectedImage && (
      <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
    )}

    <TextInput
      style={styles.input}
      placeholder="Secret message"
      value={message}
      onChangeText={setMessage}
      multiline
    />

    {/* AES Key Input (RESTORED) */}
    <TextInput
      style={styles.input}
      placeholder="AES Secret Key"
      value={aesKey}
      onChangeText={setAesKey}
    />

    <TouchableOpacity style={styles.encodeBtn} onPress={encodeNow}>
      <Text style={styles.encodeText}>Encode</Text>
    </TouchableOpacity>

    {encodedBase64 && (
      <>
        <Text style={styles.sectionTitle}>Preview:</Text>

        <Image
          source={{ uri: `data:image/png;base64,${encodedBase64}` }}
          style={styles.preview}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveToAppFolder}>
          <Text style={styles.saveText}>Save to App Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: "#34495e" }]}
          onPress={() => navigation.navigate("SavedFiles")}
        >
          <Text style={styles.saveText}>View Saved Files</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

}

/* ------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  btn: {
    backgroundColor: "#2d8cff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  preview: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
    borderRadius: 10,
    marginVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  encodeBtn: { backgroundColor: "#20bf6b", padding: 14, borderRadius: 10 },
  encodeText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  saveBtn: {
    backgroundColor: "#4b7bec",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  sectionTitle: { fontWeight: "600", marginTop: 12 },
});
  