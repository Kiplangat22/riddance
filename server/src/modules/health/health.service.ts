export default function getHealthStatus() {
  return {
    success: true,
    message: "RIDDANCE API is running 🚀",
    timestamp: new Date().toISOString(),
  };
}