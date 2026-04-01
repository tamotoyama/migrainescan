import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackParamList';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useScanLimit } from '../../hooks/useScanLimit';
import { lookupProduct } from '../../services/openFoodFacts';
import { buildPreprocessedProduct } from '../../logic/preprocessor';
import { matchTriggers } from '../../logic/ingredientMatcher';
import { scoreMatches } from '../../logic/scoringEngine';
import { generateVerdict } from '../../logic/verdictGenerator';
import { TRIGGER_DATABASE } from '../../logic/ingredientDatabase';
import { saveScanHistory } from '../../firebase/firestore';
import { logError } from '../../firebase/crashlytics';
import { logScanSuccess, logScanProductNotFound, logScanMissingIngredients } from '../../firebase/analytics';
import { useAuth } from '../../hooks/useAuth';
import { ProductNotFoundError, NetworkError } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

type ScanState = 'idle' | 'processing' | 'error';

export function ScannerScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { triggerProfile, profileComplete, userDoc, saveProfile } = useUserProfile();
  const { canScan } = useScanLimit();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const processingRef = useRef(false);

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (processingRef.current || scanState === 'processing') return;
      if (!canScan) {
        navigation.replace('PaywallModal', { source: 'scan_limit' });
        return;
      }

      processingRef.current = true;
      setScanState('processing');
      setErrorMessage(null);

      try {
        const lookupResult = await lookupProduct(data);

        const preprocessed = buildPreprocessedProduct({
          barcode: data,
          productName: lookupResult.productName,
          brandName: lookupResult.brandName,
          ingredientsTextRaw: lookupResult.ingredientsTextRaw,
          ingredientsTags: lookupResult.ingredientsTags,
          additivesTags: lookupResult.additivesTags,
          categoriesTags: lookupResult.categoriesTags,
          productFound: lookupResult.productFound,
        });

        const matches = matchTriggers(preprocessed, TRIGGER_DATABASE);
        const scoreResult = scoreMatches(matches, triggerProfile, profileComplete);
        const scanResult = generateVerdict(preprocessed, scoreResult, triggerProfile);

        // Fire-and-forget side effects
        if (user) {
          // Optimistically update local context so useScanLimit reflects consumed scan
          // immediately on return to HomeScreen — without waiting for a Firestore re-fetch.
          saveProfile({ freeScanCount: (userDoc?.freeScanCount ?? 0) + 1 }).catch((err) => {
            logError(err instanceof Error ? err : new Error(String(err)), { context: 'incrementFreeScanCount' });
          });
          saveScanHistory(user.uid, scanResult).catch((err) => {
            logError(err instanceof Error ? err : new Error(String(err)), { context: 'saveScanHistory' });
          });
        }

        logScanSuccess(scanResult.verdict);

        navigation.replace('ResultModal', { scanResult });
      } catch (err) {
        if (err instanceof ProductNotFoundError) {
          logScanProductNotFound(data);
          setErrorMessage('Product not found. Try scanning a different barcode.');
        } else if (err instanceof NetworkError) {
          setErrorMessage('Network error. Please check your connection and try again.');
        } else {
          setErrorMessage('Something went wrong. Please try again.');
          logError(err instanceof Error ? err : new Error(String(err)), { context: 'scanBarcode' });
        }
        setScanState('error');
      } finally {
        // Allow retrying after a delay
        setTimeout(() => {
          processingRef.current = false;
          if (scanState !== 'error') setScanState('idle');
        }, 2000);
      }
    },
    [canScan, navigation, profileComplete, saveProfile, scanState, triggerProfile, user, userDoc],
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionBody}>
            MigraineScan needs camera access to scan barcodes.
          </Text>
          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonLabel}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.permissionButtonLabel}>Open Settings</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={scanState === 'idle' ? handleBarcode : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
      />

      {/* UI overlay */}
      <SafeAreaView style={styles.overlay}>
        {/* Top controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => setTorchOn((t) => !t)}
          >
            <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Scan frame */}
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {scanState === 'processing' && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator color={theme.colors.white} size="large" />
                <Text style={styles.processingText}>Analyzing product…</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom instructions */}
        <View style={styles.bottomBar}>
          {scanState === 'error' ? (
            <View style={styles.errorBar}>
              <Text style={styles.errorBarText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setScanState('idle')}>
                <Text style={styles.retryLabel}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.instruction}>
              {scanState === 'processing' ? 'Looking up product…' : 'Align barcode within the frame'}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 24;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { flex: 1 },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: theme.colors.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  processingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  processingText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  bottomBar: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  instruction: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  errorBar: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  errorBarText: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  retryLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  permissionTitle: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  permissionBody: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 100,
    height: 52,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  permissionButtonLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  cancelLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.sm,
  },
});
