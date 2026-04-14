import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Linking, AppState } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { getErrorMessage } from '../../utils/error';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const PAYMENT_METHODS = [
  { key: 'online', label: 'Online' },
  { key: 'upi', label: 'UPI' },
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Card' },
] as const;

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [openingUpi, setOpeningUpi] = useState(false);
  const [recording, setRecording] = useState(false);
  const [upiSession, setUpiSession] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'upi' | 'cash' | 'card'>('online');
  const [form, setForm] = useState({
    amount: '',
    transaction_id: '',
  });
  const appStateRef = useRef(AppState.currentState);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.detail(bookingId);
      const bookingData = res.data;
      setBooking(bookingData);
      setForm(current => ({
        ...current,
        amount: String(bookingData.outstanding_amount || bookingData.total_amount || ''),
      }));
    } catch (error) {
      Alert.alert('Unable to load payment details', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Missing booking', 'No booking was selected.');
      navigation.goBack();
      return;
    }
    fetchBooking();
  }, [bookingId, fetchBooking, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (bookingId) {
        fetchBooking();
      }
    });
    return unsubscribe;
  }, [navigation, bookingId, fetchBooking]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if ((previousState === 'background' || previousState === 'inactive') && nextState === 'active' && upiSession) {
        Alert.alert(
          'Back from UPI app',
          `If you completed the payment to ${upiSession.payee_name}, enter the UPI reference number below and tap "Record Confirmed Payment".`,
        );
      }
    });

    return () => subscription.remove();
  }, [upiSession]);

  const handleRazorpayCheckout = async () => {
    const payableAmount = Number(form.amount || booking?.outstanding_amount || 0);
    if (!payableAmount || payableAmount <= 0) {
      Alert.alert('Amount required', 'Enter a valid payment amount before starting checkout.');
      return;
    }

    try {
      setPaying(true);
      const orderRes = await bookingsAPI.createPaymentOrder(bookingId, {
        amount: payableAmount,
      });

      const orderPayload = orderRes.data;
      const options = {
        key: orderPayload.key_id,
        amount: orderPayload.order?.amount,
        currency: orderPayload.order?.currency || 'INR',
        order_id: orderPayload.order?.id,
        name: orderPayload.booking?.ground_name || 'BookMyGrounds',
        description: `Booking ${orderPayload.booking?.booking_number || ''}`.trim(),
        prefill: {
          name: orderPayload.booking?.customer_name || booking?.customer_name || booking?.customer_info?.full_name || '',
          contact: orderPayload.booking?.customer_phone || booking?.customer_phone || '',
          email: orderPayload.booking?.customer_email || '',
        },
        theme: {
          color: theme.colors.primary,
        },
      };

      const paymentResult = await RazorpayCheckout.open(options);

      await bookingsAPI.verifyPayment(bookingId, {
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        payment_method: 'online',
        gateway_response: {
          source: 'react_native_razorpay_checkout',
        },
      });

      await fetchBooking();
      Alert.alert('Payment successful', 'Razorpay payment was verified successfully.', [
        {
          text: 'View booking',
          onPress: () => navigation.replace('CustomerBookingDetail', { bookingId }),
        },
      ]);
    } catch (error: any) {
      const fallback =
        error?.response?.data?.error ||
        error?.description ||
        error?.error?.description ||
        error?.message ||
        'Payment was cancelled or could not be verified.';
      Alert.alert('Checkout interrupted', fallback);
    } finally {
      setPaying(false);
    }
  };

  const handleUpiPayment = async () => {
    const payableAmount = Number(form.amount || booking?.outstanding_amount || 0);
    if (!payableAmount || payableAmount <= 0) {
      Alert.alert('Amount required', 'Enter a valid payment amount before opening the UPI app.');
      return;
    }

    try {
      setOpeningUpi(true);
      const response = await bookingsAPI.createUpiIntent(bookingId, {
        amount: payableAmount,
      });

      const payload = response.data;
      if (!payload?.upi_uri) {
        throw new Error('UPI payment link was not returned by the server.');
      }

      setUpiSession(payload);
      await Linking.openURL(payload.upi_uri);
      setSelectedMethod('upi');
      Alert.alert(
        'UPI app opened',
        `Pay ${payload.amount} to ${payload.payee_name}. After the payment succeeds, return here and enter the UPI reference number to record it.`,
      );
    } catch (error: any) {
      Alert.alert('Unable to open UPI app', getErrorMessage(error, 'No supported UPI app was available on this device.'));
    } finally {
      setOpeningUpi(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!form.amount) {
      Alert.alert('Amount required', 'Enter the payment amount before continuing.');
      return;
    }

    if (selectedMethod !== 'cash' && !form.transaction_id.trim()) {
      Alert.alert('Reference required', 'Enter the UPI, card, or gateway transaction ID before recording this payment.');
      return;
    }

    try {
      setRecording(true);
      await bookingsAPI.recordPayment(bookingId, {
        amount: Number(form.amount),
        payment_method: selectedMethod,
        transaction_id: form.transaction_id.trim() || undefined,
        status: 'success',
        gateway_response: {
          source: 'react_native_manual_payment_screen',
        },
      });
      await fetchBooking();
      Alert.alert(
        'Payment recorded',
        'This entry was saved as an already-confirmed payment. Use Razorpay checkout when the customer still needs to pay.',
      );
    } catch (error) {
      Alert.alert('Payment failed', getErrorMessage(error, 'Unable to record the payment.'));
    } finally {
      setRecording(false);
    }
  };

  if (loading || !booking) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  const outstandingAmount = Number(booking.outstanding_amount || 0);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>PAYMENT DESK</Text>
          <Text style={styles.title}>Settle this booking cleanly.</Text>
          <Text style={styles.subtitle}>
            Use Razorpay checkout for live payment. Direct UPI handoff and manual entry only help you record a payment after it is completed.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>{booking.ground_name || 'Booking'}</Text>
          <Text style={styles.summaryLine}>
            {booking.booking_date} • {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
          </Text>
          <View style={styles.amountRow}>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Total amount</Text>
              <Text style={styles.amountValue}>₹{booking.total_amount}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Outstanding</Text>
              <Text style={styles.amountValue}>₹{booking.outstanding_amount}</Text>
            </View>
          </View>
          <Text style={styles.statusText}>
            Status: {booking.status_display || booking.status} • Payment: {booking.payment_status_display || booking.payment_status}
          </Text>
        </View>

        {outstandingAmount > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Razorpay checkout</Text>
            <Text style={styles.sectionCopy}>This opens the real SDK checkout and verifies the result with your backend.</Text>
            <Button title="Pay With Razorpay" onPress={handleRazorpayCheckout} isLoading={paying} />
          </View>
        ) : null}

        {outstandingAmount > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pay via UPI app</Text>
            <Text style={styles.sectionCopy}>
              This opens Google Pay, PhonePe, BHIM, or another installed UPI app using the owner&apos;s saved UPI ID and payee name. After the transfer succeeds, you still need to record the UPI reference below.
            </Text>
            {upiSession ? (
              <View style={styles.upiPreviewCard}>
                <Text style={styles.upiPreviewLabel}>Payee name</Text>
                <Text style={styles.upiPreviewValue}>{upiSession.payee_name}</Text>
                {upiSession.bank_name ? (
                  <>
                    <Text style={styles.upiPreviewLabel}>Bank name</Text>
                    <Text style={styles.upiPreviewValue}>{upiSession.bank_name}</Text>
                  </>
                ) : null}
                <Text style={styles.upiPreviewLabel}>UPI ID</Text>
                <Text style={styles.upiPreviewValue}>{upiSession.upi_id}</Text>
                <Text style={styles.upiPreviewMeta}>Amount: ₹{upiSession.amount}</Text>
              </View>
            ) : null}
            <Button title="Open UPI App" onPress={handleUpiPayment} isLoading={openingUpi} variant="secondary" />
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Manual payment entry</Text>
          <Text style={styles.sectionCopy}>Use this only after you have already received the money offline or you have a confirmed UPI, card, or gateway reference ID.</Text>

          <Input
            label="Amount"
            value={form.amount}
            onChangeText={value => setForm(current => ({ ...current, amount: value }))}
            keyboardType="decimal-pad"
          />
          <Input
            label="Transaction ID"
            value={form.transaction_id}
            onChangeText={value => setForm(current => ({ ...current, transaction_id: value }))}
            placeholder="Optional reference"
          />

          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map(method => {
              const active = selectedMethod === method.key;
              return (
                <TouchableOpacity
                  key={method.key}
                  style={[styles.methodChip, active && styles.methodChipActive]}
                  onPress={() => setSelectedMethod(method.key)}
                  activeOpacity={0.88}>
                  <Text style={[styles.methodText, active && styles.methodTextActive]}>{method.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button title="Record Confirmed Payment" onPress={handleRecordPayment} isLoading={recording} />
        </View>

        {booking.payments?.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Payment history</Text>
            {booking.payments.map((payment: any) => (
              <View key={payment.id} style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentTitle}>₹{payment.amount}</Text>
                  <Text style={styles.paymentMeta}>
                    {(payment.payment_method || '').toUpperCase()} • {(payment.status || '').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.paymentMeta}>
                  {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-IN') : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  sectionCopy: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.l,
  },
  summaryLine: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.l,
  },
  amountRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  amountBlock: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  amountValue: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginTop: theme.spacing.s,
  },
  upiPreviewCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  upiPreviewLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginBottom: theme.spacing.xs,
  },
  upiPreviewValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
    fontWeight: '700',
  },
  upiPreviewMeta: {
    ...theme.typography.bodyS,
    color: theme.colors.primaryDark,
  },
  statusText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.l,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  methodChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
  },
  methodTextActive: {
    color: theme.colors.white,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentTitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '700',
  },
  paymentMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
