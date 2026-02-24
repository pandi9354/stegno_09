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
  Dimensions,
  ScrollView,
} from "react-native";

import { PermissionsAndroid } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import { encodeEncryptedMessage } from "../utils/lsb";
import { addSavedFile } from "../utils/savedFiles";
import { useNavigation } from "@react-navigation/native";

/* -------------------- SCREEN DIMENSIONS -------------------- */
const { width, height } = Dimensions.get("window");

/* -------------------- PERMISSIONS -------------------- */
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

/* -------------------- MAIN COMPONENT -------------------- */
export default function EncodeScreen() {
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [encodedBase64, setEncodedBase64] = useState(null);
  const [aesKey, setAesKey] = useState("");

  /* -------------------- IMAGE PICKER -------------------- */
  const pickImage = async () => {
    const granted = await hasAndroidPermission();
    if (!granted) {
      Alert.alert("Permission required", "Storage permission denied");
      return;
    }

    launchImageLibrary(
      { mediaType: "photo", includeBase64: false, quality: 1 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Picker error", response.errorMessage || "Unknown error");
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

  /* -------------------- ENSURE PNG -------------------- */
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

    const path = uri.startsWith("file://")
      ? uri.replace("file://", "")
      : uri;

    return await RNFS.readFile(path, "base64");
  }

  /* -------------------- ENCODE -------------------- */
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
      const outBase64 = encodeEncryptedMessage(
        base64Png,
        message,
        aesKey
      );
      console.log("Encoded base64 length:", outBase64?.length);
      setEncodedBase64(outBase64);
      Alert.alert("Success", "Message encoded successfully.");
    } catch (err) {
      Alert.alert("Encoding error", err.message);
    }
  };

  /* -------------------- SAVE FILE -------------------- */
  const saveToAppFolder = async () => {
    if (!encodedBase64) {
      Alert.alert("No encoded image", "Encode an image first.");
      return;
    }

    try {
      const filename = `stego_${Date.now()}.png`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      await RNFS.writeFile(filePath, encodedBase64, "base64");

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

  /* -------------------- UI -------------------- */
  return (
    <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.container}
  keyboardShouldPersistTaps="handled"
>
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

      <TextInput
        style={styles.input}
        placeholder="AES Secret Key"
        value={aesKey}
        onChangeText={setAesKey}
        secureTextEntry
      />

      <TouchableOpacity style={styles.encodeBtn} onPress={encodeNow}>
        <Text style={styles.encodeText}>Encode</Text>
      </TouchableOpacity>

      {encodedBase64 && (
        <>
          {/* <Text style={styles.sectionTitle}>Preview</Text>

          <Image
            source={{ uri: `data:image/png;base64,${encodedBase64}` }}
            style={styles.preview}
          /> */}

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
    </ScrollView>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },

  title: {
    fontSize: width * 0.05,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: height * 0.02,
  },

  btn: {
    backgroundColor: "#2d8cff",
    paddingVertical: height * 0.015,
    borderRadius: 8,
    marginBottom: height * 0.015,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: width * 0.04,
    fontWeight: "600",
  },

  preview: {
    width: width * 0.9,
    height: height * 0.3,
    alignSelf: "center",
    resizeMode: "contain",
    borderRadius: 10,
    marginVertical: height * 0.02,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    marginBottom: height * 0.015,
  },

  encodeBtn: {
    backgroundColor: "#20bf6b",
    paddingVertical: height * 0.018,
    borderRadius: 10,
  },

  encodeText: {
    color: "#fff",
    textAlign: "center",
    fontSize: width * 0.045,
    fontWeight: "700",
  },

  saveBtn: {
    backgroundColor: "#4b7bec",
    paddingVertical: height * 0.018,
    borderRadius: 10,
    marginTop: height * 0.015,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontSize: width * 0.042,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: width * 0.042,
    fontWeight: "600",
    marginTop: height * 0.02,
  },
});
