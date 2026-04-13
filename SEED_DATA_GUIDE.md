# Seed Data Documentation

## Overview

This document describes the seed data available in the Land Management system. The seed script populates the MongoDB database with sample data for testing and development purposes.

## How to Run Seed Script

```bash
# Run the seed script
npm run seed
```

This will:
- Clear all existing data in the database
- Create sample users with different roles
- Create sample land records
- Create sample transactions

## Seeded Data Structure

### 1. Users (8 Total)

| Role | Name | Email | Wallet Address |
|------|------|-------|-----------------|
| Admin | Admin Officer | admin@landregistry.com | 0x1234567890123456789012345678901234567890 |
| Registrar | Registrar Singh | registrar@landregistry.com | 0x0987654321098765432109876543210987654321 |
| Inspector | Inspector Kumar | inspector@landregistry.com | 0x1111111111111111111111111111111111111111 |
| User | Rajesh Sharma | rajesh@example.com | 0x2222222222222222222222222222222222222222 |
| User | Priya Gupta | priya@example.com | 0x3333333333333333333333333333333333333333 |
| User | Amit Patel | amit@example.com | 0x4444444444444444444444444444444444444444 |
| User | Neha Desai | neha@example.com | 0x5555555555555555555555555555555555555555 |
| User | Vikram Singh | vikram@example.com | 0x6666666666666666666666666666666666666666 |

### 2. Lands (5 Total)

#### Land 1: Green Valley Agricultural Land
- **Location:** Pune, Maharashtra
- **Area:** 50,000 sq ft
- **Owner:** Rajesh Sharma
- **Type:** Agricultural
- **Status:** Verified ✓
- **For Sale:** No

#### Land 2: Downtown Residential Plot
- **Location:** Mumbai, Maharashtra
- **Area:** 15,000 sq ft
- **Owner:** Priya Gupta
- **Type:** Residential
- **Status:** Verified ✓
- **For Sale:** Yes
- **Price:** 25 ETH

#### Land 3: Industrial Park Zone A
- **Location:** Bangalore, Karnataka
- **Area:** 100,000 sq ft
- **Owner:** Amit Patel
- **Type:** Industrial
- **Status:** Pending Verification ⏳
- **For Sale:** No

#### Land 4: Commercial Plaza Ground Floor
- **Location:** Delhi, Delhi
- **Area:** 20,000 sq ft
- **Owner:** Rajesh Sharma
- **Type:** Commercial
- **Status:** Verified ✓
- **For Sale:** Yes
- **Price:** 50 ETH

#### Land 5: Suburban Residential Complex
- **Location:** Hyderabad, Telangana
- **Area:** 35,000 sq ft
- **Owner:** Priya Gupta
- **Type:** Residential
- **Status:** Verified ✓
- **For Sale:** No

### 3. Transactions (12 Total)

| TX Type | Land ID | From | To | Status | Details |
|---------|---------|------|----|---------|---------.|
| Register | 1 | Rajesh | Contract | ✓ Confirmed | Green Valley registration |
| Verify | 1 | Inspector | Rajesh | ✓ Confirmed | Land verified |
| Register | 2 | Priya | Contract | ✓ Confirmed | Downtown residential registration |
| Verify | 2 | Inspector | Priya | ✓ Confirmed | Land verified |
| List | 2 | Priya | Contract | ✓ Confirmed | Listed for sale (25 ETH) |
| Transfer | 2 | Priya | Neha | ✓ Confirmed | Sold to Neha Desai |
| Register | 3 | Amit | Contract | ⏳ Pending | Industrial park registration |
| Register | 4 | Rajesh | Contract | ✓ Confirmed | Commercial plaza registration |
| Verify | 4 | Inspector | Rajesh | ✓ Confirmed | Commercial property verified |
| List | 4 | Rajesh | Contract | ✓ Confirmed | Listed for sale (50 ETH) |
| Register | 5 | Priya | Contract | ✓ Confirmed | Residential complex registration |
| Verify | 5 | Inspector | Priya | ✓ Confirmed | Complex verified |

## Wallet Addresses for Testing

Use these wallet addresses to test different user roles and interactions:

```
Admin:     0x1234567890123456789012345678901234567890
Registrar: 0x0987654321098765432109876543210987654321
Inspector: 0x1111111111111111111111111111111111111111
Owner 1:   0x2222222222222222222222222222222222222222
Owner 2:   0x3333333333333333333333333333333333333333
Owner 3:   0x4444444444444444444444444444444444444444
Buyer 1:   0x5555555555555555555555555555555555555555
Buyer 2:   0x6666666666666666666666666666666666666666
```

## Use Cases You Can Test

### 1. View Land Details
- Use Owner 1's address (0x222...) to view Green Valley and Commercial Plaza lands
- Use Owner 2's address (0x333...) to view Downtown Residential and Suburban Complex lands

### 2. Purchase Land
- Land 2 (Downtown Residential) is listed for sale at 25 ETH
- Land 4 (Commercial Plaza) is listed for sale at 50 ETH
- Use Buyer 1 or Buyer 2 addresses to simulate purchases

### 3. Check Verification Status
- Lands 1, 2, 4, 5 are verified
- Land 3 is pending verification (inspect permissions needed)

### 4. View Transaction History
- Each land has multiple transactions showing registration, verification, and transfer progress
- Follow the transaction chain to see how lands move between owners

### 5. Administrative Functions
- Use Admin address to manage user roles
- Use Registrar address to verify lands
- Use Inspector address to inspect and approve lands

## Database Connection

Ensure MongoDB is running before executing the seed script:

```bash
# Start MongoDB (if using local installation)
mongod

# Or check your .env file for MONGO_URI
# Default: mongodb://localhost:27017/land-management
```

## Reset Database

If you need to reset and reseed:

```bash
npm run seed
```

This will automatically clear all existing data and reload fresh sample data.

## Extending Seed Data

To add more sample data, edit `scripts/seed.js` and add entries to:
- `users` array
- `lands` array
- `transactions` array

Then run `npm run seed` to apply changes.

## Document Hashes (IPFS)

All seeded lands include mock IPFS document hashes:
- Format: Base64 encoded descriptions
- Used for demonstrating document storage
- Real IPFS integration can be tested with actual hashes

## Notes for Development

- All timestamps are set to realistic dates
- Gas usage is simulated with typical values
- Transaction hashes are mock values for testing
- Block numbers are sequential but not connected to actual blockchain
- Wallet addresses are formatted as valid Ethereum addresses for testing purposes
