import React from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../utils/theme';

interface MapPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (latitude: string, longitude: string) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  initialLocation,
  initialLatitude,
  initialLongitude,
  onLocationSelect,
}) => {
  const lat = initialLocation?.latitude || initialLatitude || 12.9716;
  const lng = initialLocation?.longitude || initialLongitude || 77.5946;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          #map { height: 100vh; width: 100vw; }
          .panel {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .search-row {
            display: flex;
            gap: 8px;
          }
          .search-input {
            flex: 1;
            height: 44px;
            border: 1px solid #d7e1ee;
            border-radius: 14px;
            padding: 0 14px;
            background: rgba(255,255,255,0.96);
            color: #102033;
            font-size: 14px;
          }
          .button {
            height: 44px;
            border: none;
            border-radius: 14px;
            padding: 0 14px;
            color: #fff;
            background: #1E64F0;
            font-weight: 600;
          }
          .secondary {
            background: rgba(7, 17, 31, 0.82);
          }
          .hint {
            background: rgba(255,255,255,0.96);
            border-radius: 14px;
            padding: 10px 12px;
            color: #526174;
            font-size: 12px;
            box-shadow: 0 8px 20px rgba(22,56,91,0.08);
          }
        </style>
      </head>
      <body>
        <div class="panel">
          <div class="search-row">
            <input id="searchInput" class="search-input" placeholder="Search by address or place" />
            <button id="searchButton" class="button">Search</button>
          </div>
          <div class="search-row">
            <button id="locateButton" class="button secondary">Use my location</button>
          </div>
          <div class="hint">Search an address, use your current location, or tap the map and drag the pin for exact placement.</div>
        </div>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
          L.control.zoom({ position: 'bottomright' }).addTo(map);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
          var searchInput = document.getElementById('searchInput');
          var searchButton = document.getElementById('searchButton');
          var locateButton = document.getElementById('locateButton');

          function updateMarker(lat, lng) {
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], Math.max(map.getZoom(), 17), { animate: true });
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
          }

          async function searchAddress() {
            var query = (searchInput.value || '').trim();
            if (!query) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Enter an address to search.' }));
              return;
            }

            try {
              var response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query), {
                headers: { 'Accept-Language': 'en' }
              });
              var results = await response.json();

              if (!results.length) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'No matching address found. Try a more specific search.' }));
                return;
              }

              var result = results[0];
              var resultLat = parseFloat(result.lat);
              var resultLng = parseFloat(result.lon);
              marker.setLatLng([resultLat, resultLng]);
              map.setView([resultLat, resultLng], 18, { animate: true });
              window.ReactNativeWebView.postMessage(JSON.stringify({
                latitude: resultLat,
                longitude: resultLng,
                address: result.display_name
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Address search failed. Check your connection and try again.' }));
            }
          }

          function locateUser() {
            if (!navigator.geolocation) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Location services are not available on this device.' }));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              function(position) {
                updateMarker(position.coords.latitude, position.coords.longitude);
              },
              function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Unable to access your current location.' }));
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }

          map.on('click', function(e) {
            updateMarker(e.latlng.lat, e.latlng.lng);
          });

          marker.on('dragend', function(e) {
            updateMarker(e.target.getLatLng().lat, e.target.getLatLng().lng);
          });

          searchButton.addEventListener('click', searchAddress);
          searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
              event.preventDefault();
              searchAddress();
            }
          });
          locateButton.addEventListener('click', locateUser);
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
            if (data.type === 'error') {
              Alert.alert('Map search', data.message);
              return;
            }
            const lat = data.latitude.toFixed(6);
            const lng = data.longitude.toFixed(6);
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
    height: 360,
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
