const paymentConfig = () => ({
  fedapay: {
    secretKey: process.env.FEDAPAY_SECRET_KEY,
    environment: process.env.FEDAPAY_ENVIRONMENT,
    apiUrl:
      process.env.FEDAPAY_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox-api.fedapay.com'
        : 'https://api.fedapay.com',
  },
});

export default paymentConfig;
