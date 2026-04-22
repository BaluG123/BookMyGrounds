import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MapPicker } from '../../components/MapPicker';
import { AmenitySelector } from '../../components/AmenitySelector';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const GROUND_TYPES = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'volleyball', 'hockey', 'multi_sport', 'other'];
const SURFACE_TYPES = ['natural_grass', 'artificial_turf', 'clay', 'concrete', 'synthetic', 'wooden', 'other'];

export default function EditGroundScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const groundId = route.params?.groundId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ground_type: 'cricket',
    surface_type: 'artificial_turf',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '12.9716',
    longitude: '77.5946',
    opening_time: '06:00:00',
    closing_time: '22:00:00',
    max_players: '22',
    rules: '',
    cancellation_policy: '',
    is_active: true,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const fetchGroundData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.detail(groundId);
      const ground = res.data;
      
      setFormData({
        name: ground.name || '',
        description: ground.description || '',
        ground_type: ground.ground_type || 'cricket',
        surface_type: ground.surface_type || 'artificial_turf',
        address: ground.address || '',
        city: ground.city || '',
        state: ground.state || '',
        pincode: ground.pincode || '',
        latitude: ground.latitude?.toString() || '12.9716',
        longitude: ground.longitude?.toString() || '77.5946',
        opening_time: ground.opening_time || '06:00:00',
        closing_time: ground.closing_time || '22:00:00',
        max_players: ground.max_players?.toString() || '22',
        rules: ground.rules || '',
        cancellation_policy: ground.cancellation_policy || '',
        is_active: ground.is_active ?? true,
      });

      if (ground.amenities) {
        setSelectedAmenities(ground.amenities.map((a: any) => a.id));
      }
      if (ground.images) {
        setExistingImages(ground.images);
      }
    } catch (e) {
      console.log('Error fetching ground data', e);
      Alert.alert('Error', 'Failed to load ground data');
    } finally {
      setLoading(false);
    }
  }, [groundId]);

  useEffect(() => {
    fetchGroundData();
  }, [fetchGroundData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name) return 'Name is required';
    if (!formData.address) return 'Address is required';
    if (!formData.city) return 'City is required';
    if (!formData.state) return 'State is required';
    if (!formData.pincode) return 'Pincode is required';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        ...formData,
        max_players: parseInt(formData.max_players, 10),
        amenity_ids: selectedAmenities,
      };

      console.log('[DEBUG] Updating ground with ID:', groundId);
      console.log('[DEBUG] Update data:', updateData);
      
      const response = await groundsAPI.update(groundId, updateData);
      console.log('[DEBUG] Update response:', response);

      // 2. Upload New Images if any
      if (newImages.length > 0) {
        console.log(`[DEBUG] Found ${newImages.length} new images to upload.`);
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          const imageData = new FormData();
          
          const fileToUpload = {
            uri: Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
            name: img.fileName || `photo_${Date.now()}.jpg`,
            type: img.type || 'image/jpeg',
          };
          
          imageData.append('images', fileToUpload as any);
          imageData.append('is_primary', 'false'); // Usually not primary for add-on images
          
          await groundsAPI.uploadImages(groundId, imageData);
          console.log(`[DEBUG] New image ${i} uploaded successfully.`);
        }
      }
      
      Alert.alert('Success', 'Ground updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.goBack();
            // Optionally pass a refresh flag
            if (route.params?.onUpdate) {
              route.params.onUpdate();
            }
          }
        }
      ]);
    } catch (e: any) {
      console.log('[DEBUG] Error updating ground:', e);
      console.log('[DEBUG] Error response:', e.response?.data);
      console.log('[DEBUG] Error status:', e.response?.status);
      const errorMsg = e.response?.data?.detail || 
                       e.response?.data?.message || 
                       e.response?.data?.error ||
                       JSON.stringify(e.response?.data) ||
                       'Failed to update ground';
      Alert.alert('Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
      includeBase64: false,
    });

    if (result.assets) {
      setNewImages([...newImages, ...result.assets]);
    }
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingImageId(imageId);
              await groundsAPI.deleteImage(groundId, imageId);
              setExistingImages(prev => prev.filter(img => img.id !== imageId));
            } catch (e) {
              console.log('Error deleting image', e);
              Alert.alert('Error', 'Failed to delete image');
            } finally {
              setDeletingImageId(null);
            }
          }
        }
      ]
    );
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Input
          label="Ground Name *"
          placeholder="Enter ground name"
          value={formData.name}
          onChangeText={(v) => handleInputChange('name', v)}
        />
        <Input
          label="Description"
          placeholder="About the ground"
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
          value={formData.description}
          onChangeText={(v) => handleInputChange('description', v)}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Ground Type</Text>
            <View style={styles.selectorContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {GROUND_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, formData.ground_type === t && styles.chipActive]}
                    onPress={() => handleInputChange('ground_type', t)}
                  >
                    <Text style={[styles.chipText, formData.ground_type === t && styles.chipTextActive]}>
                      {t.replace('_', ' ').charAt(0).toUpperCase() + t.replace('_', ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Surface Type</Text>
            <View style={styles.selectorContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SURFACE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, formData.surface_type === t && styles.chipActive]}
                    onPress={() => handleInputChange('surface_type', t)}
                  >
                    <Text style={[styles.chipText, formData.surface_type === t && styles.chipTextActive]}>
                      {t.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Location Details</Text>
        <Input
          label="Address *"
          placeholder="Street address"
          value={formData.address}
          onChangeText={(v) => handleInputChange('address', v)}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="City *"
              placeholder="City"
              value={formData.city}
              onChangeText={(v) => handleInputChange('city', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Pincode *"
              placeholder="Pincode"
              keyboardType="numeric"
              value={formData.pincode}
              onChangeText={(v) => handleInputChange('pincode', v)}
            />
          </View>
        </View>
        <Input
          label="State *"
          placeholder="State"
          value={formData.state}
          onChangeText={(v) => handleInputChange('state', v)}
        />
        
        <MapPicker 
          initialLatitude={parseFloat(formData.latitude)}
          initialLongitude={parseFloat(formData.longitude)}
          onLocationSelect={(lat, lng) => {
            handleInputChange('latitude', lat);
            handleInputChange('longitude', lng);
          }} 
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Operational Details</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Opening Time"
              placeholder="06:00:00"
              value={formData.opening_time}
              onChangeText={(v) => handleInputChange('opening_time', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Closing Time"
              placeholder="22:00:00"
              value={formData.closing_time}
              onChangeText={(v) => handleInputChange('closing_time', v)}
            />
          </View>
        </View>
        <Input
          label="Max Players"
          placeholder="22"
          keyboardType="numeric"
          value={formData.max_players}
          onChangeText={(v) => handleInputChange('max_players', v)}
        />

        <AmenitySelector 
          selectedIds={selectedAmenities} 
          onSelect={setSelectedAmenities} 
        />

        <Input
          label="Rules"
          placeholder="Ground rules and policies"
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
          value={formData.rules}
          onChangeText={(v) => handleInputChange('rules', v)}
        />

        <Input
          label="Cancellation Policy"
          placeholder="Cancellation policy details"
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
          value={formData.cancellation_policy}
          onChangeText={(v) => handleInputChange('cancellation_policy', v)}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Photos</Text>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.subLabel}>Current Photos ({existingImages.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {existingImages.map((img) => (
                <View key={img.id} style={styles.imageWrapper}>
                  <Image source={{ uri: img.image }} style={styles.thumbnail} />
                  <TouchableOpacity 
                    style={styles.deleteBadge} 
                    onPress={() => handleDeleteExistingImage(img.id)}
                    disabled={deletingImageId === img.id}
                  >
                    {deletingImageId === img.id ? (
                      <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                      <Icon name="close" size={16} color={theme.colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* New Images */}
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImages}>
          <Icon name="camera-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.imagePickerText}>Add more photos</Text>
        </TouchableOpacity>

        {newImages.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.subLabel}>New Photos to Upload ({newImages.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {newImages.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.deleteBadge} onPress={() => handleRemoveNewImage(idx)}>
                    <Icon name="close" size={16} color={theme.colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Button
          title={submitting ? "Updating..." : "Update Ground"}
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
  },
  label: {
    ...theme.typography.bodyS,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s,
  },
  selectorContainer: {
    marginBottom: theme.spacing.m,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    backgroundColor: theme.colors.backgroundLight,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textMain,
  },
  chipTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 32,
    marginBottom: 40,
  },
  subLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.m,
  },
  deleteBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imagePicker: {
    height: 100,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '20',
  },
  imagePickerText: {
    ...theme.typography.bodyS,
    color: theme.colors.primary,
    marginTop: 4,
  },
});
