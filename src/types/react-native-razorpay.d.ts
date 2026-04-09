declare module 'react-native-razorpay' {
  const RazorpayCheckout: {
    open(options: Record<string, any>): Promise<Record<string, any>>;
  };

  export default RazorpayCheckout;
}
