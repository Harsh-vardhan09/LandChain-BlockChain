require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Land = require("../models/Land");
const Transaction = require("../models/Transaction");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/land-management";

// Sample wallet addresses
const WALLETS = {
  admin: "0x1234567890123456789012345678901234567890",
  registrar: "0x0987654321098765432109876543210987654321",
  inspector: "0x1111111111111111111111111111111111111111",
  owner1: "0x2222222222222222222222222222222222222222",
  owner2: "0x3333333333333333333333333333333333333333",
  owner3: "0x4444444444444444444444444444444444444444",
  buyer1: "0x5555555555555555555555555555555555555555",
  buyer2: "0x6666666666666666666666666666666666666666",
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Land.deleteMany({});
    await Transaction.deleteMany({});
    console.log("✓ Cleared existing data");

    // ==================== SEED USERS ====================
    const users = [
      {
        walletAddress: WALLETS.admin,
        name: "Admin Officer",
        email: "admin@landregistry.com",
        phone: "+91-9876543210",
        aadharNumber: "1234-5678-9012",
        role: "admin",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.registrar,
        name: "Registrar Singh",
        email: "registrar@landregistry.com",
        phone: "+91-9876543211",
        aadharNumber: "1234-5678-9013",
        role: "registrar",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.inspector,
        name: "Inspector Kumar",
        email: "inspector@landregistry.com",
        phone: "+91-9876543212",
        aadharNumber: "1234-5678-9014",
        role: "inspector",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.owner1,
        name: "Rajesh Sharma",
        email: "rajesh@example.com",
        phone: "+91-9000000001",
        aadharNumber: "1234-5678-9015",
        role: "user",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.owner2,
        name: "Priya Gupta",
        email: "priya@example.com",
        phone: "+91-9000000002",
        aadharNumber: "1234-5678-9016",
        role: "user",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.owner3,
        name: "Amit Patel",
        email: "amit@example.com",
        phone: "+91-9000000003",
        aadharNumber: "1234-5678-9017",
        role: "user",
        isVerified: false,
      },
      {
        walletAddress: WALLETS.buyer1,
        name: "Neha Desai",
        email: "neha@example.com",
        phone: "+91-9000000004",
        aadharNumber: "1234-5678-9018",
        role: "user",
        isVerified: true,
      },
      {
        walletAddress: WALLETS.buyer2,
        name: "Vikram Singh",
        email: "vikram@example.com",
        phone: "+91-9000000005",
        aadharNumber: "1234-5678-9019",
        role: "user",
        isVerified: true,
      },
    ];

    await User.insertMany(users);
    console.log(`✓ Seeded ${users.length} users`);

    // ==================== SEED LANDS ====================
    const lands = [
      {
        landId: 1,
        title: "Green Valley Agricultural Land",
        location: "Pune, Maharashtra",
        coordinates: { lat: 18.5204, lng: 73.8567 },
        areaSqFt: 50000,
        owner: WALLETS.owner1,
        registeredBy: WALLETS.registrar,
        isVerified: true,
        isForSale: false,
        salePrice: "0",
        district: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        landType: "agricultural",
        documentHash: "QmVyeWZpcmlyIGZyb20gQWdyaWN1bHR1cmUgTWluaXN0cnk=",
        documentUrl: "https://ipfs.io/ipfs/QmVyeWZpcmlyIGZyb20gQWdyaWN1bHR1cmUgTWluaXN0cnk=",
        registeredAt: new Date("2024-01-15"),
        lastUpdated: new Date("2024-01-15"),
      },
      {
        landId: 2,
        title: "Downtown Residential Plot",
        location: "Mumbai, Maharashtra",
        coordinates: { lat: 19.0176, lng: 72.8479 },
        areaSqFt: 15000,
        owner: WALLETS.owner2,
        registeredBy: WALLETS.registrar,
        isVerified: true,
        isForSale: true,
        salePrice: "25", // 25 ETH
        district: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        landType: "residential",
        documentHash: "QmZvckVkIHJlc2lkZW50aWFsIGxhbmQgZG9jdW1lbnQ=",
        documentUrl: "https://ipfs.io/ipfs/QmZvckVkIHJlc2lkZW50aWFsIGxhbmQgZG9jdW1lbnQ=",
        registeredAt: new Date("2024-02-10"),
        lastUpdated: new Date("2024-03-01"),
      },
      {
        landId: 3,
        title: "Industrial Park Zone A",
        location: "Bangalore, Karnataka",
        coordinates: { lat: 12.9716, lng: 77.594 },
        areaSqFt: 100000,
        owner: WALLETS.owner3,
        registeredBy: WALLETS.registrar,
        isVerified: false,
        isForSale: false,
        salePrice: "0",
        district: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        landType: "industrial",
        documentHash: "QmluZHVzdHJpYWwgcGFyayBkb2N1bWVudHM=",
        documentUrl: "https://ipfs.io/ipfs/QmluZHVzdHJpYWwgcGFyayBkb2N1bWVudHM=",
        registeredAt: new Date("2024-03-05"),
        lastUpdated: new Date("2024-03-05"),
      },
      {
        landId: 4,
        title: "Commercial Plaza Ground Floor",
        location: "Delhi, Delhi",
        coordinates: { lat: 28.6139, lng: 77.2090 },
        areaSqFt: 20000,
        owner: WALLETS.owner1,
        registeredBy: WALLETS.registrar,
        isVerified: true,
        isForSale: true,
        salePrice: "50", // 50 ETH
        district: "Central Delhi",
        state: "Delhi",
        pincode: "110001",
        landType: "commercial",
        documentHash: "QmNvbW1lcmNpYWwgcHJvcGVydHkgZG9jdW1lbnQ=",
        documentUrl: "https://ipfs.io/ipfs/QmNvbW1lcmNpYWwgcHJvcGVydHkgZG9jdW1lbnQ=",
        registeredAt: new Date("2024-01-20"),
        lastUpdated: new Date("2024-02-15"),
      },
      {
        landId: 5,
        title: "Suburban Residential Complex",
        location: "Hyderabad, Telangana",
        coordinates: { lat: 17.3850, lng: 78.4867 },
        areaSqFt: 35000,
        owner: WALLETS.owner2,
        registeredBy: WALLETS.registrar,
        isVerified: true,
        isForSale: false,
        salePrice: "0",
        district: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        landType: "residential",
        documentHash: "UmVzaWRlbnRpYWwgY29tcGxleCBkb2N1bWVudHM=",
        documentUrl: "https://ipfs.io/ipfs/UmVzaWRlbnRpYWwgY29tcGxleCBkb2N1bWVudHM=",
        registeredAt: new Date("2024-02-20"),
        lastUpdated: new Date("2024-02-20"),
      },
    ];

    await Land.insertMany(lands);
    console.log(`✓ Seeded ${lands.length} lands`);

    // ==================== SEED TRANSACTIONS ====================
    const transactions = [
      {
        txHash: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx",
        type: "register",
        landId: 1,
        from: WALLETS.owner1,
        to: "0x0000000000000000000000000000000000000000", // contract address
        amount: "0",
        blockNumber: 15400000,
        status: "confirmed",
        timestamp: new Date("2024-01-15T10:30:00Z"),
        gasUsed: "150000",
        metadata: {
          title: "Green Valley Agricultural Land",
          location: "Pune, Maharashtra",
        },
      },
      {
        txHash: "0x123abc456def789ghi012jkl345mno678pqr901stu234vwx",
        type: "verify",
        landId: 1,
        from: WALLETS.inspector,
        to: WALLETS.owner1,
        amount: "0",
        blockNumber: 15410000,
        status: "confirmed",
        timestamp: new Date("2024-01-15T12:00:00Z"),
        gasUsed: "100000",
        metadata: {
          verificationNotes: "Land verified as agricultural plot",
          documentHash: "QmVyeWZpcmlyIGZyb20gQWdyaWN1bHR1cmUgTWluaXN0cnk=",
        },
      },
      {
        txHash: "0x456def789ghi012jkl345mno678pqr901stu234vwx123abc",
        type: "register",
        landId: 2,
        from: WALLETS.owner2,
        to: "0x0000000000000000000000000000000000000000",
        amount: "0",
        blockNumber: 15420000,
        status: "confirmed",
        timestamp: new Date("2024-02-10T09:45:00Z"),
        gasUsed: "145000",
        metadata: {
          title: "Downtown Residential Plot",
          location: "Mumbai, Maharashtra",
        },
      },
      {
        txHash: "0x789ghi012jkl345mno678pqr901stu234vwx123abc456def",
        type: "verify",
        landId: 2,
        from: WALLETS.inspector,
        to: WALLETS.owner2,
        amount: "0",
        blockNumber: 15430000,
        status: "confirmed",
        timestamp: new Date("2024-02-11T14:20:00Z"),
        gasUsed: "98000",
        metadata: {
          verificationNotes: "Residential plot verified",
          documentHash: "QmZvckVkIHJlc2lkZW50aWFsIGxhbmQgZG9jdW1lbnQ=",
        },
      },
      {
        txHash: "0xghi012jkl345mno678pqr901stu234vwx123abc456def789",
        type: "list",
        landId: 2,
        from: WALLETS.owner2,
        to: "0x0000000000000000000000000000000000000000",
        amount: "25",
        blockNumber: 15440000,
        status: "confirmed",
        timestamp: new Date("2024-03-01T11:15:00Z"),
        gasUsed: "120000",
        metadata: {
          salePrice: "25",
          currency: "ETH",
          reason: "Relocation to another city",
        },
      },
      {
        txHash: "0xjkl345mno678pqr901stu234vwx123abc456def789ghi012",
        type: "transfer",
        landId: 2,
        from: WALLETS.owner2,
        to: WALLETS.buyer1,
        amount: "25",
        blockNumber: 15450000,
        status: "confirmed",
        timestamp: new Date("2024-03-10T16:45:00Z"),
        gasUsed: "180000",
        metadata: {
          transactionType: "sale",
          pricePerSqFt: "1.67",
          buyerName: "Neha Desai",
        },
      },
      {
        txHash: "0xmno678pqr901stu234vwx123abc456def789ghi012jkl345",
        type: "register",
        landId: 3,
        from: WALLETS.owner3,
        to: "0x0000000000000000000000000000000000000000",
        amount: "0",
        blockNumber: 15460000,
        status: "pending",
        timestamp: new Date("2024-03-05T08:30:00Z"),
        gasUsed: "155000",
        metadata: {
          title: "Industrial Park Zone A",
          location: "Bangalore, Karnataka",
          status: "pending_verification",
        },
      },
      {
        txHash: "0xpqr901stu234vwx123abc456def789ghi012jkl345mno678",
        type: "register",
        landId: 4,
        from: WALLETS.owner1,
        to: "0x0000000000000000000000000000000000000000",
        amount: "0",
        blockNumber: 15470000,
        status: "confirmed",
        timestamp: new Date("2024-01-20T13:00:00Z"),
        gasUsed: "148000",
        metadata: {
          title: "Commercial Plaza Ground Floor",
          location: "Delhi, Delhi",
        },
      },
      {
        txHash: "0xstu234vwx123abc456def789ghi012jkl345mno678pqr901",
        type: "verify",
        landId: 4,
        from: WALLETS.inspector,
        to: WALLETS.owner1,
        amount: "0",
        blockNumber: 15480000,
        status: "confirmed",
        timestamp: new Date("2024-01-21T10:15:00Z"),
        gasUsed: "102000",
        metadata: {
          verificationNotes: "Commercial property verified",
          documentHash: "QmNvbW1lcmNpYWwgcHJvcGVydHkgZG9jdW1lbnQ=",
        },
      },
      {
        txHash: "0xvwx123abc456def789ghi012jkl345mno678pqr901stu234",
        type: "list",
        landId: 4,
        from: WALLETS.owner1,
        to: "0x0000000000000000000000000000000000000000",
        amount: "50",
        blockNumber: 15490000,
        status: "confirmed",
        timestamp: new Date("2024-02-15T15:30:00Z"),
        gasUsed: "118000",
        metadata: {
          salePrice: "50",
          currency: "ETH",
          reason: "Business expansion",
        },
      },
      {
        txHash: "0x123abc456def789ghi012jkl345mno678pqr901stu234vwx",
        type: "register",
        landId: 5,
        from: WALLETS.owner2,
        to: "0x0000000000000000000000000000000000000000",
        amount: "0",
        blockNumber: 15500000,
        status: "confirmed",
        timestamp: new Date("2024-02-20T11:25:00Z"),
        gasUsed: "152000",
        metadata: {
          title: "Suburban Residential Complex",
          location: "Hyderabad, Telangana",
        },
      },
      {
        txHash: "0x456def789ghi012jkl345mno678pqr901stu234vwx123abc",
        type: "verify",
        landId: 5,
        from: WALLETS.inspector,
        to: WALLETS.owner2,
        amount: "0",
        blockNumber: 15510000,
        status: "confirmed",
        timestamp: new Date("2024-02-21T09:50:00Z"),
        gasUsed: "101000",
        metadata: {
          verificationNotes: "Residential complex verified successfully",
          documentHash: "UmVzaWRlbnRpYWwgY29tcGxleCBkb2N1bWVudHM=",
        },
      },
    ];

    await Transaction.insertMany(transactions);
    console.log(`✓ Seeded ${transactions.length} transactions`);

    // ==================== SUMMARY ====================
    console.log("\n" + "=".repeat(50));
    console.log("✅ Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("\nSeeded Data Summary:");
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Lands: ${lands.length}`);
    console.log(`  • Transactions: ${transactions.length}`);
    console.log("\nSample Wallet Addresses:");
    Object.entries(WALLETS).forEach(([role, address]) => {
      console.log(`  • ${role.toUpperCase()}: ${address}`);
    });
    console.log("\n" + "=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
