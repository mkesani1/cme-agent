import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase, callEdgeFunction } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card, Button, Input } from '../../../src/components/ui';
import { colors, spacing, typography, CMECategory, cmeCategories } from '../../../src/lib/theme';

// Type for AI scan results (matches edge function response)
interface ScanResponse {
  success: boolean;
  extracted: {
    course_name?: string;
    provider?: string;
    credit_hours?: number;
    category?: string;
    completion_date?: string;
    confidence?: number;
    accreditation?: string;
    certificate_id?: string;
  };
  message?: string;
  error?: string;
}

const CATEGORIES: CMECategory[] = ['general', 'controlled_substances', 'risk_management', 'ethics', 'pain_management'];

export default function UploadCertificateScreen() {
  const { user } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [provider, setProvider] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [category, setCategory] = useState<CMECategory | null>(null);
  const [completionDate, setCompletionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanConfidence, setScanConfidence] = useState<number | null>(null);

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        // Reset scan confidence when new image is selected
        setScanConfidence(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  }

  async function scanCertificateWithAI() {
    if (!selectedImage || !user) return;

    setScanning(true);
    try {
      // Convert image to base64 for the edge function
      const imageResponse = await fetch(selectedImage.uri);
      const blob = await imageResponse.blob();

      // Convert blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get pure base64
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Call the scan-certificate edge function (camelCase params match server)
      const scanResponse = await callEdgeFunction<ScanResponse>('scanCertificate', {
        imageBase64: base64,
        mimeType: 'image/jpeg',
      });

      if (!scanResponse.success || !scanResponse.extracted) {
        throw new Error(scanResponse.error || 'Failed to extract certificate data');
      }

      const result = scanResponse.extracted;

      // Pre-fill form fields with extracted data
      if (result.course_name) setCourseName(result.course_name);
      if (result.provider) setProvider(result.provider);
      if (result.credit_hours) setCreditHours(result.credit_hours.toString());
      if (result.category && CATEGORIES.includes(result.category as CMECategory)) {
        setCategory(result.category as CMECategory);
      }
      if (result.completion_date) setCompletionDate(result.completion_date);
      if (result.confidence) setScanConfidence(result.confidence / 100); // Convert 0-100 to 0-1

      // Show success with confidence indicator (result.confidence is already 0-100)
      const confidenceText = result.confidence
        ? ` (${Math.round(result.confidence)}% confident)`
        : '';

      Alert.alert(
        'Scan Complete',
        `Certificate data extracted${confidenceText}. Please review and correct any fields if needed.`
      );
    } catch (error) {
      console.error('AI scan error:', error);
      Alert.alert(
        'Scan Failed',
        'Could not extract certificate data. Please enter the information manually.'
      );
    } finally {
      setScanning(false);
    }
  }

  async function uploadImageToStorage(asset: ImagePicker.ImagePickerAsset): Promise<string | null> {
    try {
      setUploadingImage(true);

      const fileName = `${user!.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Storage upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit() {
    if (!courseName || !creditHours || !completionDate) {
      Alert.alert('Missing Fields', 'Please fill in the required fields.');
      return;
    }

    const hours = parseFloat(creditHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Invalid Credits', 'Please enter a valid number of credit hours.');
      return;
    }

    setLoading(true);

    let certificateUrl: string | null = null;

    // Upload image if selected
    if (selectedImage) {
      certificateUrl = await uploadImageToStorage(selectedImage);
      if (!certificateUrl) {
        Alert.alert('Error', 'Failed to upload certificate image. Please try again.');
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.from('certificates').insert({
      user_id: user!.id,
      course_name: courseName,
      provider: provider || null,
      credit_hours: hours,
      category: category,
      completion_date: completionDate,
      verified: false,
      certificate_url: certificateUrl,
    }).select().single();

    if (error) {
      Alert.alert('Error', 'Failed to save certificate. Please try again.');
      setLoading(false);
      return;
    }

    // Auto-allocate to matching licenses
    if (data && category) {
      const { data: licenses } = await supabase
        .from('licenses')
        .select('id')
        .eq('user_id', user!.id);

      if (licenses) {
        for (const license of licenses) {
          const { data: requirement } = await supabase
            .from('license_requirements')
            .select('id')
            .eq('license_id', license.id)
            .eq('category', category)
            .single();

          if (requirement) {
            await supabase.from('credit_allocations').insert({
              certificate_id: data.id,
              license_id: license.id,
              requirement_id: requirement.id,
              credits_applied: hours,
            });
          }
        }
      }
    }

    setLoading(false);
    Alert.alert(
      'Success',
      'Certificate added successfully!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Certificate</Text>
        <Text style={styles.subtitle}>
          Enter the details from your CME certificate
        </Text>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color={colors.accent} />
            ) : (
              <>
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="camera-outline" size={32} color={colors.accent} />
                </View>
                <Text style={styles.uploadText}>Add Certificate Image</Text>
              </>
            )}
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setScanConfidence(null);
                  }}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
                onPress={scanCertificateWithAI}
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <ActivityIndicator size="small" color={colors.background} />
                    <Text style={styles.scanButtonText}>Scanning...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color={colors.background} />
                    <Text style={styles.scanButtonText}>Scan with AI</Text>
                  </>
                )}
              </TouchableOpacity>
              {scanConfidence !== null && (
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(scanConfidence * 100)}% match
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter manually</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Entry Form */}
        <Card style={styles.formCard}>
          <Input
            label="Course Name *"
            value={courseName}
            onChangeText={setCourseName}
            placeholder="e.g., Opioid Prescribing Safety"
            containerStyle={styles.input}
          />

          <Input
            label="Provider"
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g., AMA Ed Hub"
            containerStyle={styles.input}
          />

          <Input
            label="Credit Hours *"
            value={creditHours}
            onChangeText={setCreditHours}
            placeholder="e.g., 2.5"
            keyboardType="decimal-pad"
            containerStyle={styles.input}
          />

          <Input
            label="Completion Date *"
            value={completionDate}
            onChangeText={setCompletionDate}
            placeholder="YYYY-MM-DD"
            containerStyle={styles.input}
          />

          {/* Category Selection */}
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(category === cat ? null : cat)}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: cmeCategories[cat].color },
                  ]}
                />
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}>
                  {cmeCategories[cat].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title="Save Certificate"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.submitButton}
        />

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            Upload a photo of your certificate and tap "Scan with AI" to automatically
            extract the course details. Credits will be matched to your license
            requirements based on the category.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  uploadOption: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    minHeight: 120,
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flex: 1,
    gap: spacing.sm,
  },
  imagePreview: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.text,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: colors.background,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    color: colors.success,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sand[200],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  infoBox: {
    backgroundColor: colors.sand[200],
    padding: spacing.md,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
