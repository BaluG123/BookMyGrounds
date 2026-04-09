import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: Record<string, unknown>) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}

export function openFromNotification(data?: Record<string, any>) {
  if (!data) {
    navigate('Notifications');
    return;
  }

  const bookingId = data.booking_id;
  const groundId = data.ground_id;
  const screen = data.screen;

  if (screen === 'AdminBookingDetail' && bookingId) {
    navigate('AdminBookingDetail', { bookingId });
    return;
  }

  if ((screen === 'BookingDetail' || screen === 'WriteReview') && bookingId) {
    navigate('CustomerBookingDetail', { bookingId });
    return;
  }

  if (screen === 'GroundDetail' && groundId) {
    navigate('GroundDetail', { id: groundId });
    return;
  }

  if (bookingId) {
    navigate('CustomerBookingDetail', { bookingId });
    return;
  }

  if (groundId) {
    navigate('GroundDetail', { id: groundId });
    return;
  }

  navigate('Notifications');
}
