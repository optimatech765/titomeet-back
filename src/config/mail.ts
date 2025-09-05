const mailConfig = () => ({
  smtpHost: process.env.NODEMAILER_SMTP_HOST || 'smtp.gmail.com',
  smtpPort: process.env.NODEMAILER_SMTP_PORT || 587,
  smtpUser: process.env.NODEMAILER_SMTP_USER || 'your-email@gmail.com',
  smtpPassword: process.env.NODEMAILER_SMTP_PASSWORD || 'your-password',
});

export default mailConfig;
