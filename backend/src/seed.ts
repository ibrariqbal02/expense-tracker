import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { Expense } from "./models/Expense";

const SEED_EMAIL = "ibrar@gmail.com";

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Utilities",
  "Travel",
  "Education",
  "Personal Care",
  "Other",
];

async function seed() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) throw new Error("MONGODB_URI is not defined in .env");

  await mongoose.connect(mongoURI);
  console.log("✅ Connected to MongoDB");


  const user = await User.findOne({ email: SEED_EMAIL });
  if (!user) {
    console.error(`❌ User with email "${SEED_EMAIL}" not found. Please register first.`);
    process.exit(1);
  }
  console.log(`✅ Found user: ${user.name} (${user.email})`);


  const existingCategories = await Category.find({ user: user._id });
  let categories = existingCategories;

  if (existingCategories.length === 0) {
    console.log("📂 No categories found — creating default categories...");
    const created = await Category.insertMany(
      DEFAULT_CATEGORIES.map((name) => ({ name, user: user._id }))
    );
    categories = created;
    console.log(`✅ Created ${created.length} categories`);
  } else {
    console.log(`✅ Using ${existingCategories.length} existing categories`);
  }

  const categoryIds = categories.map((c) => c._id);

 
  const expenses = Array.from({ length: 100 }, () => ({
    title: faker.commerce.productName(),
    amount: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
    category: faker.helpers.arrayElement(categoryIds),
    date: faker.date.between({
      from: new Date("2025-01-01"),
      to: new Date("2026-08-27"),
    }),
    description: faker.lorem.sentence(),
    receiptUrl: "",
    user: user._id,
  }));

  await Expense.insertMany(expenses);
  console.log(`✅ Seeded 100 fake expenses for "${SEED_EMAIL}"`);

  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
