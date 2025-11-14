const appConfig = () => ({
  geocodeApiKey: process.env.GEOCODE_API_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
});

export default appConfig;
