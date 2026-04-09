import { Alert, Linking } from 'react-native';
import { getErrorMessage } from './error';

export async function openCoordinatesInGoogleMaps(params: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  label?: string;
}) {
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    Alert.alert('Location unavailable', 'This ground does not have valid map coordinates yet.');
    return;
  }

  const label = params.label ? encodeURIComponent(params.label) : 'Destination';
  const appUrl = `comgooglemaps://?q=${latitude},${longitude}(${label})&center=${latitude},${longitude}&zoom=17`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  try {
    const canOpenGoogleMaps = await Linking.canOpenURL(appUrl);
    await Linking.openURL(canOpenGoogleMaps ? appUrl : webUrl);
  } catch (error) {
    Alert.alert('Unable to open maps', getErrorMessage(error, 'Please try again in a moment.'));
  }
}
