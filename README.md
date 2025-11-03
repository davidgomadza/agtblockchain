# Advanced Genetic Synthesis Technology (AGT) Blockchain

A comprehensive multi-token blockchain ecosystem designed for the Advanced Genetic Synthesis Technology platform.

## Features

- **Multi-Token Support**: Native support for 6 different tokens (AGT, S96t', BTCYT, BTC, GTPS, AGOLD)
- **Secure Wallet System**: Elliptic curve cryptography for wallet security
- **Smart Contract Ready**: Deploy and execute token contracts
- **Proof of Work Consensus**: Secure mining mechanism
- **REST API**: Full HTTP API for blockchain interaction
- **Transaction Signing**: Digital signatures for secure transactions

## Tokens

1. **AGT** - Advanced Genetic Synthesis Technology
2. **S96t'** - Sealofapprovalis7628396t' S96t'
3. **BTCYT** - Bitcoinayt
4. **BTC** - Bitcoin
5. **GTPS** - Global Transaction Payment Solution
6. **AGOLD** - AGT Gold

## Installation

```bash
git clone https://github.com/davidgomadza/agt-blockchain.git
cd agt-blockchain
npm install

Usage
Start the blockchain node
npm start

Start Mining
npm run miner

API Endpoints
API Endpoints

· POST /wallet/create - Create new wallet
· POST /wallet/import - Import wallet with secret phrase
· POST /transaction/create - Create transaction
· GET /wallet/:address/balance - Get wallet balances
· POST /mine - Mine pending transactions
· GET /tokens - List all tokens

Example Usage

```javascript
const { AGTBlockchain } = require('./src/core/Blockchain');
const Wallet = require('./src/core/Wallet');

// Create blockchain instance
const blockchain = new AGTBlockchain();

// Create wallets
const wallet1 = new Wallet("my-secret-phrase");
const wallet2 = new Wallet();

// Create transaction
const transaction = wallet1.createTransaction(
    wallet2.getAddress(),
    1000,
    'AGT',
    blockchain
);

// Add transaction to pending pool
blockchain.addTransaction(transaction);

// Mine transactions
blockchain.minePendingTransactions(wallet1.getAddress());

// Check balances
console.log("Wallet1 AGT Balance:", blockchain.getBalanceOfAddress(wallet1.getAddress(), 'AGT'));
```

Security

· Uses secp256k1 elliptic curve cryptography
· Transaction signing and verification
· Proof of Work consensus mechanism
· Genesis block with predefined token distribution

License

MIT License

```
