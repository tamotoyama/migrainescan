import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MigraineScan",
  slug: "migrainescan",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FDFBF7",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.migrainescan.app",
    buildNumber: "1",
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription:
        "MigraineScan uses your camera to scan food barcodes.",
      NSPhotoLibraryUsageDescription:
        "MigraineScan may access your photo library for barcode images.",
    },
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission:
          "MigraineScan uses your camera to scan food barcodes for migraine trigger ingredient detection.",
      },
    ],
    "expo-apple-authentication",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/crashlytics",
  ],
  extra: {
    eas: {
      projectId: '042c3d85-9bd0-42c8-9983-3c6e12d79c96',
    },
  },
  owner: "tamotoyama",
});
