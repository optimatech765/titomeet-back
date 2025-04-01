const paymentConfig = () => ({
  fedapay: {
    secretKey: process.env.FEDAPAY_SECRET_KEY,
    environment: process.env.FEDAPAY_ENVIRONMENT,
  },
});

export default paymentConfig;
