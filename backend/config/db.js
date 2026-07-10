import mongoose from "mongoose";
import dns from "dns";

const logAtlasTroubleshooting = () => {
  console.error("\n💡 MongoDB Atlas troubleshooting:");
  console.error("   1. Atlas → Network Access → add your IP or 0.0.0.0/0 (dev only)");
  console.error("   2. Atlas → Clusters → resume if paused");
  console.error("   3. Check MONGODB_URI username/password in .env");
};

const connectDB = async () => {
  const mongoUri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  if (mongoUri.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }

  const maxAttempts = 5;
  const connectOptions = {
    serverSelectionTimeoutMS: 45000,
    connectTimeoutMS: 45000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri, connectOptions);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      await mongoose.disconnect().catch(() => {});

      console.error(
        `❌ MongoDB attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      );

      if (attempt === maxAttempts) {
        logAtlasTroubleshooting();
        process.exit(1);
      }

      const delayMs = 3000 * attempt;
      console.log(`↻ Retrying in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;