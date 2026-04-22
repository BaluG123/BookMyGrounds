import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { getErrorMessage } from '../../utils/error';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { formatTime12h } from '../../utils/pricing';

const PAYMENT_METHODS = [
  { key: 'online', label: 'Online', icon: 'globe-outline' },
  { key: 'cash', label: 'Cash', icon: 'cash-outline' },
  { key: 'card', label: 'Card', icon: 'card-outline' },
] as const;

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'cash' | 'card'>('online');
  const [form, setForm] = useState({
    amount: '',
    transaction_id: '',
  });
  const [isTestMode, setIsTestMode] = useState(false);
  // Success animation refs
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const showSuccessAnimation = useCallback(() => {
    setPaymentSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 3 seconds
    setTimeout(() => {
      navigation.replace('CustomerBookingDetail', { bookingId });
    }, 3000);
  }, [successScale, successOpacity, navigation, bookingId]);

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

    // Fetch user role to determine if manual entry should be shown
    const getRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserRole(parsed.role);
        }
      } catch {
        console.warn('Failed to fetch user role');
      }
    };
    getRole();
  }, [bookingId, fetchBooking, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (bookingId) {
        fetchBooking();
      }
    });
    return unsubscribe;
  }, [navigation, bookingId, fetchBooking]);

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
      const keyId = orderPayload.key_id || '';
      setIsTestMode(keyId.startsWith('rzp_test_'));

      const options = {
        key: keyId,
        amount: orderPayload.order?.amount,
        currency: orderPayload.order?.currency || 'INR',
        order_id: orderPayload.order?.id,
        name: 'BookMyGrounds',
        description: `${booking?.ground_name || 'Turf'} - Booking #${booking?.booking_number || ''}`.trim(),
        prefill: {
          name: orderPayload.booking?.customer_name || booking?.customer_name || booking?.customer_info?.full_name || '',
          contact: orderPayload.booking?.customer_phone || booking?.customer_phone || '',
          email: orderPayload.booking?.customer_email || '',
        },
        theme: {
          color: theme.colors.primary,
        },
      };

      console.log('Opening Razorpay with options:', { ...options, key: '***' });
      const paymentResult = await RazorpayCheckout.open(options);
      console.log('Razorpay Result:', paymentResult);

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
      showSuccessAnimation();
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

  const handleRecordPayment = async () => {
    if (!form.amount) {
      Alert.alert('Amount required', 'Enter the payment amount before continuing.');
      return;
    }

    if (selectedMethod !== 'cash' && !form.transaction_id.trim()) {
      Alert.alert('Reference required', 'Enter the reference or transaction ID before recording this payment.');
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
      showSuccessAnimation();
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

  // Success State
  if (paymentSuccess) {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successCard,
              { opacity: successOpacity, transform: [{ scale: successScale }] },
            ]}
          >
            <View style={styles.successIconCircle}>
              <Icon name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>
              {isTestMode ? 'Test Payment Verified! 🧪' : 'Payment Successful! 🎉'}
            </Text>
            <Text style={styles.successSubtitle}>
              {isTestMode 
                ? 'Your simulated payment was verified by the sandbox server.'
                : `Your payment for ${booking.ground_name} has been verified and recorded.`}
            </Text>
            <View style={styles.successDetail}>
              <Text style={styles.successDetailLabel}>Booking</Text>
              <Text style={styles.successDetailValue}>#{booking.booking_number}</Text>
            </View>
            <View style={styles.successDetail}>
              <Text style={styles.successDetailLabel}>Date & Time</Text>
              <Text style={styles.successDetailValue}>
                {booking.booking_date} • {formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)}
              </Text>
            </View>
            <Text style={styles.successRedirect}>Redirecting to booking details...</Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  const outstandingAmount = Number(booking.outstanding_amount || 0);

  return (
    <ScreenContainer>
      {isTestMode && (
        <View style={styles.sandboxBanner}>
          <Icon name="flask-outline" size={16} color={theme.colors.white} />
          <Text style={styles.sandboxText}>DEBUG: RAZORPAY SANDBOX ACTIVE (NO REAL MONEY)</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Icon name="arrow-back" size={22} color={theme.colors.textMain} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Payment</Text>
            <Text style={styles.headerSubtitle}>{booking.ground_name}</Text>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryGround}>{booking.ground_name || 'Booking'}</Text>
              <Text style={styles.summaryLine}>
                {booking.booking_date} • {formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)}
              </Text>
            </View>
            <View style={styles.bookingNumBadge}>
              <Text style={styles.bookingNumText}>#{booking.booking_number}</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            {Number(booking.base_amount || 0) > Number(booking.total_amount || 0) ? (
              <View style={styles.amountBlock}>
                <Text style={styles.amountLabel}>Base</Text>
                <Text style={styles.amountValue}>₹{booking.base_amount}</Text>
              </View>
            ) : null}
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amountValue}>₹{booking.total_amount}</Text>
            </View>
            <View style={[styles.amountBlock, outstandingAmount > 0 && styles.amountBlockHighlight]}>
              <Text style={styles.amountLabel}>Due</Text>
              <Text style={[styles.amountValue, outstandingAmount > 0 && styles.amountValueDue]}>
                ₹{booking.outstanding_amount}
              </Text>
            </View>
          </View>
          {Number(booking.discount_amount || 0) > 0 ? (
            <View style={styles.offerSummary}>
              <View style={styles.offerSummaryRow}>
                <Text style={styles.offerSummaryLabel}>Savings applied</Text>
                <Text style={styles.offerSummaryValue}>-₹{booking.discount_amount}</Text>
              </View>
              {booking.promo_code_display ? (
                <Text style={styles.offerSummaryMeta}>Promo code: {booking.promo_code_display}</Text>
              ) : null}
              {booking.referral_code_used ? (
                <Text style={styles.offerSummaryMeta}>Referral code: {booking.referral_code_used}</Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.statusRow}>
            <Icon name="information-circle-outline" size={16} color={theme.colors.textSoft} />
            <Text style={styles.statusText}>
              {booking.status_display || booking.status} • Payment: {booking.payment_status_display || booking.payment_status}
            </Text>
          </View>
        </View>

        {/* Razorpay Checkout */}
        {outstandingAmount > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="shield-checkmark-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Secure Checkout</Text>
            </View>
            <Text style={styles.sectionCopy}>Pay securely with Razorpay. Supports UPI, cards, net banking, and wallets.</Text>
            <Button
              title={`Pay ₹${outstandingAmount} with Razorpay`}
              onPress={handleRazorpayCheckout}
              isLoading={paying}
              icon={<Icon name="lock-closed-outline" size={16} color={theme.colors.white} />}
            />
          </View>
        ) : null}



        {/* Manual Entry - Only visible to Admins/Owners */}
        {userRole === 'admin' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="create-outline" size={22} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Manual Entry</Text>
            </View>
            <Text style={styles.sectionCopy}>Record a payment after money has been received offline or via a confirmed reference.</Text>

            <Input
              label="Amount"
              value={form.amount}
              onChangeText={value => setForm(current => ({ ...current, amount: value }))}
              keyboardType="decimal-pad"
              leftIcon={<Text style={{ fontSize: 16, color: theme.colors.textSoft }}>₹</Text>}
            />
            <Input
              label="Transaction ID"
              value={form.transaction_id}
              onChangeText={value => setForm(current => ({ ...current, transaction_id: value }))}
              placeholder="UPI ref / Card auth / Gateway ID"
              leftIcon={<Icon name="key-outline" size={16} color={theme.colors.textSoft} />}
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
                    <Icon
                      name={method.icon}
                      size={16}
                      color={active ? theme.colors.white : theme.colors.textMain}
                    />
                    <Text style={[styles.methodText, active && styles.methodTextActive]}>{method.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Record Payment"
              onPress={handleRecordPayment}
              isLoading={recording}
              icon={<Icon name="checkmark-done-outline" size={16} color={theme.colors.white} />}
            />
          </View>
        )}

        {/* Payment History */}
        {booking.payments?.length ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="receipt-outline" size={22} color={theme.colors.textMuted} />
              <Text style={styles.sectionTitle}>Payment History</Text>
            </View>
            {booking.payments.map((payment: any) => (
              <View key={payment.id} style={styles.paymentRow}>
                <View style={styles.paymentLeft}>
                  <Icon
                    name={
                      payment.payment_method === 'card' ? 'card-outline' :
                      payment.payment_method === 'cash' ? 'cash-outline' :
                      'globe-outline'
                    }
                    size={18}
                    color={payment.status === 'success' ? theme.colors.success : theme.colors.textSoft}
                  />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>₹{payment.amount}</Text>
                    <Text style={styles.paymentMeta}>
                      {(payment.payment_method || '').toUpperCase()} • {(payment.status || '').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.paymentDate}>
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
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
    ...theme.shadows.soft,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  headerSubtitle: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Summary
  summaryCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.l,
  },
  summaryGround: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  summaryLine: {
    ...theme.typography.bodyS,
    color: '#B3C7DC',
    marginTop: 4,
  },
  bookingNumBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  bookingNumText: {
    ...theme.typography.caption,
    color: '#9CCAFF',
  },
  amountRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  amountBlock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
  },
  amountBlockHighlight: {
    backgroundColor: 'rgba(255,107,87,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,87,0.3)',
  },
  amountLabel: {
    ...theme.typography.caption,
    color: '#B3C7DC',
  },
  amountValue: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
  },
  amountValueDue: {
    color: theme.colors.coral || '#FF6B57',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    ...theme.typography.bodyS,
    color: '#B3C7DC',
  },
  offerSummary: {
    marginBottom: theme.spacing.m,
    backgroundColor: '#E9FFF7',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
  },
  offerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerSummaryLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.primaryDark,
  },
  offerSummaryValue: {
    ...theme.typography.h3,
    color: theme.colors.success,
  },
  offerSummaryMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  // Sandbox
  sandboxBanner: {
    backgroundColor: '#FF4757',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  sandboxText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 10,
  },
  // Section Cards
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
  },
  sectionCopy: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.l,
  },
  // UPI
  upiPreviewCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  upiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  upiPreviewLabel: {
    ...theme.typography.bodyS,
    color: theme.colors.textSoft,
  },
  upiPreviewValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  // Payment Methods
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.l,
    gap: theme.spacing.s,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
    gap: 6,
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
  // Payment History
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  paymentInfo: {},
  paymentTitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '700',
  },
  paymentMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  paymentDate: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  successCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.strong,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D9FBF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
  },
  successTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  successSubtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  successDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  successDetailLabel: {
    ...theme.typography.bodyS,
    color: theme.colors.textSoft,
  },
  successDetailValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  successRedirect: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginTop: theme.spacing.l,
  },
});
