const paymentConfig = () => ({
  fedapay: {
    secretKey: process.env.FEDAPAY_SECRET_KEY,
    environment: process.env.FEDAPAY_ENVIRONMENT,
    apiUrl: process.env.FEDAPAY_API_URL,
  },
});

export default paymentConfig;
