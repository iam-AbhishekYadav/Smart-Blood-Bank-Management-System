import "../config/env.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      role: "admin",
      isActive: true,
      department: "Operations",
      accessLevel: "super",
    },
    { new: true }
  );

  if (!user) {
    console.error("User not found. Register first, then promote to admin.");
    process.exit(1);
  }

  console.log(`Promoted ${user.email} to admin.`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
