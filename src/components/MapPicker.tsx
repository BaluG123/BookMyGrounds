import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../utils/theme';

interface MapPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  onLocationSelect: (latitude: string, longitude: string) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ initialLocation, onLocationSelect }) => {
  const lat = initialLocation?.latitude || 12.9716; // Default Bangalore
  const lng = initialLocation?.longitude || 77.5946;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

          function updateMarker(lat, lng) {
            marker.setLatLng([lat, lng]);
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
          }

          map.on('click', function(e) {
            updateMarker(e.latlng.lat, e.latlng.lng);
          });

          marker.on('dragend', function(e) {
            updateMarker(e.target.getLatLng().lat, e.target.getLatLng().lng);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pick Ground Location</Text>
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            const lat = data.latitude.toFixed(6);
            const lng = data.longitude.toFixed(6);
            console.log('[DEBUG] MapPicker: Location selected:', lat, lng);
            onLocationSelect(lat, lng);
          }}
          style={styles.map}
          scrollEnabled={false}
        />
      </View>
      <Text style={styles.hint}>Tap on the map or drag the marker to your turf location</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.m,
  },
  label: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  mapContainer: {
    height: 300,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  map: {
    flex: 1,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
