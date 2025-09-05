const awsConfig = () => ({
  AWS_REGION: process.env.AWS_REGION ?? 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? 'secret',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME ?? '',
  AWS_BUCKET_PUBLIC_URL: process.env.AWS_BUCKET_PUBLIC_URL ?? '',
});

export default awsConfig;