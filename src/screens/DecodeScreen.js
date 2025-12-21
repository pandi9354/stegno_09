// src/screens/DecodeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  FlatList,
} from "react-native";

import RNFS from "react-native-fs";
import { launchImageLibrary } from "react-native-image-picker";
import { decodeEncryptedMessage } from "../utils/lsb";
import { getSavedFiles } from "../utils/savedFiles";

export default function DecodeScreen({ route }) {
  const [decoded, setDecoded] = useState(null);
  const [aesKey, setAesKey] = useState(""); // start empty
  const [filePath, setFilePath] = useState("");
  const [savedImages, setSavedImages] = useState([]);

  /** Load internal images */
  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async () => {
    const files = await getSavedFiles();
    setSavedImages(files);
  };

  /** Auto decode if navigated */
  useEffect(() => {
    const incoming = route?.params?.filePath || "";
    if (incoming) handleDecode(incoming);
  }, [route?.params?.filePath]);

  /** Pick image from gallery */
  const pickFromGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, (resp) => {
      if (resp.didCancel || resp.errorMessage) return;

      const uri = resp.assets[0].uri;
      handleDecode(uri);
    });
  };

  /** Decode PNG file */
  const handleDecode = async (path) => {
  try {
    if (!aesKey.trim()) {
      Alert.alert("AES Key Missing", "Please enter the AES secret key first.");
      return;
    }

    const clean =
      path.startsWith("file://") ? path.replace("file://", "") : path;

    const base64 = await RNFS.readFile(clean, "base64");
    const plain = decodeEncryptedMessage(base64, aesKey);

    setDecoded(plain);
    setFilePath(path);

    Alert.alert("Decoded Successfully", plain);
  } catch (err) {
    Alert.alert("Decode Error", err.message);
  }
};


  /** Render grid of saved images */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageBox}
      onPress={() => handleDecode(item.path)}
    >
      <Image source={{ uri: "file://" + item.path }} style={styles.gridImage} />
      <Text style={styles.imageName}>{item.filename}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Decode Hidden Message</Text>

      <Text style={styles.label}>AES Key</Text>
      <TextInput style={styles.input} value={aesKey} onChangeText={setAesKey} />

      {/* --- NEW BUTTON: PICK FROM GALLERY --- */}
      <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
        <Text style={styles.galleryBtnText}>Pick Image From Gallery</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Or choose an image from saved storage:</Text>

      <FlatList
        data={savedImages}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
        numColumns={2}
        ListEmptyComponent={
          <Text style={{ color: "#777", marginTop: 20 }}>
            No images saved yet.
          </Text>
        }
      />

      <Text style={styles.resultLabel}>Decoded Output:</Text>
      <Text style={styles.result}>
        {decoded ? decoded : "No decoded message yet."}
      </Text>
    </View>
  );
}

/* ------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },

  label: { marginTop: 10, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  galleryBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  galleryBtnText: { color: "white", fontWeight: "700" },

  section: { marginTop: 10, fontWeight: "600", marginBottom: 10 },

  imageBox: {
    width: "47%",
    margin: "1.5%",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    alignItems: "center",
  },
  gridImage: { width: "100%", height: 120, borderRadius: 8 },
  imageName: { marginTop: 6, fontSize: 12 },

  resultLabel: { marginTop: 16, fontWeight: "700" },
  result: { marginTop: 8, fontSize: 15, color: "#444" },
});
