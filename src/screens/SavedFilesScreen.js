import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import RNFS from "react-native-fs";
import { getSavedFiles } from "../utils/savedFiles";
import { useNavigation } from "@react-navigation/native";

export default function SavedFilesScreen() {
  const navigation = useNavigation();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const f = await getSavedFiles();
      setFiles(f);
    };
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation]);

  const openFile = (item) => {
    navigation.navigate("Decode", { filePath: item.path });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => openFile(item)}>
      <Image
        source={{ uri: "file://" + item.path }}
        style={styles.thumbnail}
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.filename}>{item.filename}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Stego Files</Text>

      <FlatList
        data={files}
        keyExtractor={(i) => i.path}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, color: "#777" }}>
            No saved files yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  item: {
    flexDirection: "row",
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#f1f2f6",
    borderRadius: 10,
  },
  thumbnail: { width: 60, height: 60, borderRadius: 6 },
  filename: { fontWeight: "600" },
  date: { fontSize: 11, color: "#666", marginTop: 4 },
});
