# Base Sepolia Testnet Deployment Guide

Complete guide to deploy a smart contract on Base Sepolia testnet and generate proof of 1+ transactions for hackathon submission.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup Wallet & Get Test ETH](#setup-wallet--get-test-eth)
3. [Project Setup](#project-setup)
4. [Deploy Smart Contract](#deploy-smart-contract)
5. [Execute Transactions](#execute-transactions)
6. [Submission Proof](#submission-proof)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MetaMask Wallet** - [Install Extension](https://metamask.io/)
- **Git Bash** (Windows) or Terminal (Mac/Linux)

### Project Structure
```
blockchain/
├── contracts/
│   └── AppCredits.sol          # Smart contract
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── mint-direct.js          # Mint script
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies
├── .env                        # Environment variables (create this)
└── .env.example                # Template
```

---

## Setup Wallet & Get Test ETH

### Step 1: Install & Configure MetaMask

1. Install MetaMask browser extension
2. Create a new wallet or import existing one
3. **Save your seed phrase securely!**

### Step 2: Add Base Sepolia Network to MetaMask

**Option A: Manual Setup**
1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Fill in:
   - **Network Name:** `Base Sepolia`
   - **RPC URL:** `https://sepolia.base.org`
   - **Chain ID:** `84532`
   - **Currency Symbol:** `ETH`
   - **Block Explorer:** `https://sepolia.basescan.org`
4. Click "Save"

**Option B: Quick Add via Chainlist**
1. Go to: https://chainlist.org/chain/84532
2. Click "Connect Wallet"
3. Click "Add to MetaMask"
4. Approve in MetaMask

### Step 3: Get Test ETH

You need ETH on **Base Sepolia** (not Ethereum Sepolia!).

**Method 1: Get Sepolia ETH, then bridge to Base Sepolia**

1. **Get Sepolia ETH:**
   - Google Cloud Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - Alchemy Faucet: https://sepoliafaucet.com/
   - Infura Faucet: https://www.infura.io/faucet/sepolia

2. **Bridge to Base Sepolia:**
   - Go to: https://superbridge.app/base-sepolia
   - Connect MetaMask
   - **From:** Sepolia
   - **To:** Base Sepolia
   - Amount: `0.01` ETH
   - Click "Bridge" and wait 1-2 minutes

**Method 2: Get Base Sepolia ETH directly**
- Alchemy Base Sepolia: https://www.alchemy.com/faucets/base-sepolia
- QuickNode: https://faucet.quicknode.com/base/sepolia

### Step 4: Verify You Have Base Sepolia ETH

1. Open MetaMask
2. Switch to "Base Sepolia" network
3. Should see ~0.01-0.1 ETH balance

---

## Project Setup

### Step 1: Navigate to Blockchain Folder

```bash
cd blockchain
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Hardhat (Ethereum development environment)
- Ethers.js (Ethereum library)
- TypeScript support
- Hardhat plugins

### Step 3: Get Your Private Key from MetaMask

⚠️ **SECURITY WARNING:** Only use this for TESTNET! Never share your mainnet private key!

1. Open MetaMask
2. Click **3 dots (⋮)** → "Account details"
3. Click **"Show private key"**
4. Enter your MetaMask password
5. **Copy the private key** (starts with `0x`)

### Step 4: Create `.env` File

Create a new file `blockchain/.env` (not `.env.example`):

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

**Example:**
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

**Important:**
- Replace `0xYOUR_PRIVATE_KEY_HERE` with your actual private key
- Must start with `0x`
- No spaces or quotes
- Must be exactly 66 characters (0x + 64 hex characters)

### Step 5: Compile Smart Contract

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 1 Solidity file successfully
```

---

## Deploy Smart Contract

### Step 1: Run Deployment Script

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Step 2: Save Contract Address

**Expected output:**
```
AppCredits deployed to: 0xABCD1234...5678
```

**Copy this address!** You'll need it for:
1. Minting credits
2. Submission proof

**Example:**
```
AppCredits deployed to: 0x15169BA8B71e80d784C7F20E712813Ef9E23F603
```

### Step 3: View on Block Explorer

Open: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`

Example: https://sepolia.basescan.org/address/0x15169BA8B71e80d784C7F20E712813Ef9E23F603

You should see:
- ✅ Contract creation transaction
- ✅ Contract code
- ✅ Transaction history

---

## Execute Transactions

### Step 1: Update Mint Script with Your Contract Address

Open `blockchain/scripts/mint-direct.js` and replace the contract address:

```javascript
const contractAddr = "0xYOUR_CONTRACT_ADDRESS_HERE";
```

### Step 2: Run Mint Transaction

```bash
npx hardhat run scripts/mint-direct.js --network baseSepolia
```

**Expected output:**
```
Starting...
Signer: 0x4407C2B2d43147d8e44248d98e9644b49d0D65aD
Contract: 0x15169BA8B71e80d784C7F20E712813Ef9E23F603
Minting...
TX HASH: 0xccda26bf748b27856822477d670c13a68ebc6539c0160757184a7090cf431b45
LINK: https://sepolia.basescan.org/tx/0xccda26bf748b27856822477d670c13a68ebc6539c0160757184a7090cf431b45
Waiting...
DONE!
```

### Step 3: Verify Transaction on Explorer

Open the transaction link from the output.

You should see:
- ✅ Status: Success
- ✅ From: Your wallet address
- ✅ To: Contract address
- ✅ Function: `mint(address to, uint256 amount)`
- ✅ Block number

---

## Submission Proof

### What You Need to Submit

1. **Contract Address**
2. **Transaction Links** (deployment + mint)
3. **Screenshots** of explorer pages

### Proof Template

```
=== BASE SEPOLIA TESTNET DEPLOYMENT ===

Contract Name: AppCredits
Network: Base Sepolia Testnet
Chain ID: 84532

Contract Address:
0x15169BA8B71e80d784C7F20E712813Ef9E23F603

Transaction 1 (Deployment):
https://sepolia.basescan.org/address/0x15169BA8B71e80d784C7F20E712813Ef9E23F603

Transaction 2 (Mint 100 Credits):
https://sepolia.basescan.org/tx/0xccda26bf748b27856822477d670c13a68ebc6539c0160757184a7090cf431b45

Total On-Chain Transactions: 2 ✅
```

### Screenshots to Take

**Screenshot 1: Contract Page**
- URL: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`
- Shows: Contract address, creation transaction, balance

**Screenshot 2: Mint Transaction**
- URL: `https://sepolia.basescan.org/tx/YOUR_MINT_TX_HASH`
- Shows: Transaction hash, status (success), block number, from/to addresses

---

## Troubleshooting

### Error: "insufficient funds for gas"

**Problem:** No ETH on Base Sepolia network

**Solution:**
1. Check MetaMask is on "Base Sepolia" network (not "Sepolia")
2. Get Base Sepolia ETH from faucet or bridge
3. Verify balance shows in MetaMask

### Error: "private key too short"

**Problem:** Private key in `.env` is incomplete or malformed

**Solution:**
1. Check `.env` file has `PRIVATE_KEY=0x...` (66 characters total)
2. No spaces, quotes, or line breaks
3. Must start with `0x`
4. Re-export from MetaMask if needed

### Error: "Network baseSepolia doesn't exist"

**Problem:** Typo in network name

**Solution:**
- Use `--network baseSepolia` (exact spelling, case-sensitive)
- Check `hardhat.config.ts` has `baseSepolia` network defined

### Script Hangs with No Output

**Problem:** TypeScript compilation or RPC connection issue

**Solution:**
1. Use JavaScript version: `npx hardhat run scripts/mint-direct.js --network baseSepolia`
2. Test RPC: `curl https://sepolia.base.org -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
3. Recompile: `npx hardhat compile`

### Error: "HardhatEthersProvider.resolveName not implemented"

**Problem:** Contract address not set in `.env` or script

**Solution:**
- Use `mint-direct.js` which has hardcoded contract address
- Or update `.env` with `CONTRACT=0xYourAddress`

---

## Smart Contract Details

### AppCredits.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AppCredits {
    string public name = "AppCredits";
    string public symbol = "CRED";
    uint8 public decimals = 0;  // Whole numbers only
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "not owner");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
```

**Features:**
- ERC-20-like token with 0 decimals (whole numbers)
- Owner can mint credits
- Users can transfer credits
- Simple and gas-efficient

---

## Useful Links

### Base Sepolia Resources
- **RPC URL:** https://sepolia.base.org
- **Chain ID:** 84532
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.alchemy.com/faucets/base-sepolia
- **Bridge:** https://superbridge.app/base-sepolia

### Documentation
- **Base Docs:** https://docs.base.org
- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js Docs:** https://docs.ethers.org/v6/

### Support
- **Base Discord:** https://discord.gg/buildonbase
- **Hardhat Discord:** https://discord.gg/hardhat

---

## Summary Checklist

- [ ] MetaMask installed and configured
- [ ] Base Sepolia network added to MetaMask
- [ ] Test ETH obtained on Base Sepolia
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with private key
- [ ] Contract compiled (`npx hardhat compile`)
- [ ] Contract deployed to Base Sepolia
- [ ] Contract address saved
- [ ] Mint transaction executed
- [ ] Both transactions verified on BaseScan
- [ ] Screenshots taken
- [ ] Proof prepared for submission

---

**Congratulations! You've successfully deployed to Base Sepolia testnet!** 🎉

For questions or issues, refer to the troubleshooting section or reach out to the Base community on Discord.
