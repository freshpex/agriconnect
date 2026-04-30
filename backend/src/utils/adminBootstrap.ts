import { Farmer } from "../models/Farmer";

export async function ensureAdminUser(): Promise<void> {
  const phone = process.env.ADMIN_BOOTSTRAP_PHONE;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = process.env.ADMIN_BOOTSTRAP_NAME || "AgriConnect Admin";

  if (!phone || !password) {
    return;
  }

  const existing = await Farmer.findOne({ phone });

  if (!existing) {
    await Farmer.create({
      name,
      phone,
      password,
      role: "admin",
      simSwapChecked: true,
      simSwapLastCheck: new Date(),
    });
    console.log("✅ Admin bootstrap user created");
    return;
  }

  if (existing.role !== "admin") {
    existing.role = "admin";
    await existing.save();
    console.log("✅ Admin bootstrap user promoted to admin role");
  }
}
