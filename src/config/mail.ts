const mailConfig = () => ({
  senderEmail: process.env.NODEMAILER_SENDER_EMAIL,
  senderPassword: process.env.NODEMAILER_SENDER_PASSWORD,
});

export default mailConfig;
