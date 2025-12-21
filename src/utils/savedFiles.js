// src/utils/savedFiles.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "SAVED_STEGO_FILES";

export async function addSavedFile(fileObj) {
  // fileObj = { path, filename, createdAt }

  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  let list = existing ? JSON.parse(existing) : [];

  // Add newest on top
  list.unshift(fileObj);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getSavedFiles() {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
}

export async function clearSavedFiles() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
