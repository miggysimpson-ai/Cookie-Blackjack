import { getDb } from "../api/queries/connection";
import { cardSkins, tableSkins } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed card skins
  const existingCardSkins = await db.select().from(cardSkins).limit(1);
  if (existingCardSkins.length === 0) {
    console.log("Seeding card skins...");
    await db.insert(cardSkins).values([
      {
        name: "Classic Blue",
        description: "The timeless casino standard",
        imageUrl: "/assets/card-skin-classic.png",
        price: 0,
        themeColor: "#1E88E5",
        isDefault: true,
      },
      {
        name: "Pink Donut",
        description: "Sweet and sprinkled",
        imageUrl: "/assets/card-skin-donut.png",
        price: 500,
        themeColor: "#E91E63",
      },
      {
        name: "Chocolate Cake",
        description: "Rich and delicious",
        imageUrl: "/assets/card-skin-cake.png",
        price: 1000,
        themeColor: "#5D4037",
      },
      {
        name: "Golden Cookie",
        description: "Shiny golden treat",
        imageUrl: "/assets/card-skin-golden.png",
        price: 2500,
        themeColor: "#FFD700",
      },
      {
        name: "Rainbow Swirl",
        description: "Colorful and magical",
        imageUrl: "/assets/card-skin-rainbow.png",
        price: 5000,
        themeColor: "#FF5722",
      },
      {
        name: "Midnight Ace",
        description: "Elegant starry night",
        imageUrl: "/assets/card-skin-midnight.png",
        price: 10000,
        themeColor: "#1A237E",
      },
      {
        name: "Royal Red",
        description: "Fit for a king",
        imageUrl: "/assets/card-skin-royal.png",
        price: 25000,
        themeColor: "#D32F2F",
      },
      {
        name: "Emerald Forest",
        description: "Enchanted woodland",
        imageUrl: "/assets/card-skin-emerald.png",
        price: 50000,
        themeColor: "#2E7D32",
      },
      {
        name: "Galaxy Sparkle",
        description: "Cosmic beauty",
        imageUrl: "/assets/card-skin-galaxy.png",
        price: 100000,
        themeColor: "#7B1FA2",
      },
      {
        name: "Cookie God",
        description: "The ultimate divine skin",
        imageUrl: "/assets/card-skin-god.png",
        price: 500000,
        themeColor: "#FFD700",
      },
    ]);
  }

  // Seed table skins
  const existingTableSkins = await db.select().from(tableSkins).limit(1);
  if (existingTableSkins.length === 0) {
    console.log("Seeding table skins...");
    await db.insert(tableSkins).values([
      {
        name: "Classic Green",
        description: "The traditional casino felt",
        cssGradient: "radial-gradient(circle at center, #4CAF50 0%, #2E7D32 100%)",
        price: 0,
        isDefault: true,
      },
      {
        name: "Royal Purple",
        description: "Majestic purple velvet",
        cssGradient: "radial-gradient(circle at center, #7B1FA2 0%, #4A148C 100%)",
        price: 1000,
      },
      {
        name: "Ocean Blue",
        description: "Deep sea tranquility",
        cssGradient: "radial-gradient(circle at center, #0288D1 0%, #01579B 100%)",
        price: 2500,
      },
      {
        name: "Sunset Orange",
        description: "Warm sunset glow",
        cssGradient: "radial-gradient(circle at center, #F57C00 0%, #E65100 100%)",
        price: 5000,
      },
      {
        name: "Midnight Black",
        description: "Sophisticated darkness",
        cssGradient: "radial-gradient(circle at center, #424242 0%, #212121 100%)",
        price: 10000,
      },
      {
        name: "Rose Garden",
        description: "Romantic pink petals",
        cssGradient: "radial-gradient(circle at center, #E91E63 0%, #880E4F 100%)",
        price: 25000,
      },
      {
        name: "Golden Palace",
        description: "Opulent gold luxury",
        cssGradient: "radial-gradient(circle at center, #FBC02D 0%, #F57F17 100%)",
        price: 50000,
      },
      {
        name: "Cookie Crumbs",
        description: "Bakery warmth",
        cssGradient: "radial-gradient(circle at center, #D2691E 0%, #8B4513 100%)",
        price: 100000,
      },
      {
        name: "Cosmic Void",
        description: "Deep space mystery",
        cssGradient: "radial-gradient(circle at center, #1A237E 0%, #000051 100%)",
        price: 250000,
      },
      {
        name: "Cookie God's Realm",
        description: "Divine golden paradise",
        cssGradient: "radial-gradient(circle at center, #FFD700 0%, #B8860B 100%)",
        price: 1000000,
      },
    ]);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
