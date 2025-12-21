// src/utils/permissions.js
import { PermissionsAndroid, Platform } from "react-native";

export async function requestAndroidWritePermission() {
  if (Platform.OS !== "android") return true;

  const readImagesPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
  const writePermission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const permissionToRequest = Platform.Version >= 33 ? readImagesPermission : writePermission;

  const granted = await PermissionsAndroid.request(permissionToRequest, {
    title: "Storage Permission",
    message: "App needs permission to save images to your gallery.",
    buttonPositive: "OK",
  });

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}
