const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
let dbUri = process.env.mongodb_connection_string || process.env.MONGODB_URI || "";
try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const matches = envContent.match(/mongodb_connection_string=(.*)/);
    if (matches && matches[1]) {
      dbUri = matches[1].trim();
    }
    
  }
} catch (e) {
  console.warn("Could not read .env.local");
}

if (!dbUri) {
  console.error("Error: Please define mongodb_connection_string or MONGODB_URI in your environment or .env.local");
  process.exit(1);
}

async function seed() {
  console.log("Connecting to:", dbUri);
  await mongoose.connect(dbUri);

  // Define simple MasterAdmin Schema inline to avoid complex TS compile dependencies
  const MasterAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });

  const MasterAdmin = mongoose.models.masterAdmin || mongoose.model("masterAdmin", MasterAdminSchema);

  const email = "admin@example.com";
  const password = "admin";

  const existing = await MasterAdmin.findOne({ email });
  if (existing) {
    console.log(`Admin account with email "${email}" already exists.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new MasterAdmin({
      email,
      password: hashedPassword
    });
    await admin.save();
    console.log(`Successfully seeded master admin account:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }

  await mongoose.connection.close();
  console.log("Database connection closed.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
