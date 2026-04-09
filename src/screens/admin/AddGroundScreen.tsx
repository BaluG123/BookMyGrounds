import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { useNavigation } from '@react-navigation/native';
import { MapPicker } from '../../components/MapPicker';
import { AmenitySelector } from '../../components/AmenitySelector';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const GROUND_TYPES = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'volleyball', 'hockey', 'multi_sport', 'other'];
const SURFACE_TYPES = ['natural_grass', 'artificial_turf', 'clay', 'concrete', 'synthetic', 'wooden', 'other'];

export default function AddGroundScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  
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
  });

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [images, setImages] = useState<any[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
      includeBase64: false,
    });

    if (result.assets) {
      console.log('[DEBUG] Image picker result:', result.assets);
      setImages(result.assets);
    }
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
      setLoading(true);
      
      const groundData = {
        ...formData,
        max_players: parseInt(formData.max_players),
        amenity_ids: selectedAmenities,
        is_active: true,
      };

      console.log('[DEBUG] Starting ground creation with data:', groundData);
      
      const res = await groundsAPI.create(groundData);
      const groundId = res.data.id;
      console.log('[DEBUG] Ground created successfully with ID:', groundId);

      // 2. Upload Images
      if (images.length > 0) {
        console.log(`[DEBUG] Found ${images.length} images to upload.`);
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imageData = new FormData();
          
          // React Native file object format
          const fileToUpload = {
            uri: Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
            name: img.fileName || `photo_${i}.jpg`,
            type: img.type || 'image/jpeg',
          };
          
          imageData.append('images', fileToUpload as any);
          imageData.append('is_primary', i === 0 ? 'true' : 'false');
          
          console.log(`[DEBUG] Attempting upload for index ${i}...`);
          await groundsAPI.uploadImages(groundId, imageData);
          console.log(`[DEBUG] Image ${i} uploaded successfully.`);
        }
      }

      Alert.alert('Success', 'Turf listed successfully with photos!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      console.log('[DEBUG] Error in submission flow:', e);
      if (e.response) {
        console.log('[DEBUG] Response status:', e.response.status);
        console.log('[DEBUG] Response data:', e.response.data);
      }
      Alert.alert('Error', e.response?.data?.message || 'Failed to create turf');
    } finally {
      setLoading(false);
    }
  };

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

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Photos</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImages}>
          <Icon name="camera-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.imagePickerText}>Add up to 5 photos</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewList}>
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        )}

        <Button
          title={loading ? "Creating..." : "List My Turf"}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  imagePreviewList: {
    marginTop: theme.spacing.m,
    flexDirection: 'row',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.m,
    marginRight: 8,
  },
  submitBtn: {
    marginTop: 32,
    marginBottom: 40,
  },
});
