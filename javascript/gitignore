// Core Blockchain Implementation
class AGTBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.tokens = new Map();
        this.wallets = new Map();
        this.difficulty = 4;
        this.miningReward = 100;
        
        // Initialize the token ecosystem
        this.initializeTokens();
    }

    createGenesisBlock() {
        return {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: "0",
            hash: this.calculateHash(0, Date.now(), [], "0"),
            nonce: 0
        };
    }

    initializeTokens() {
        const initialTokens = [
            { name: "Advanced Genetic Synthesis Technology", symbol: "AGT", amount: "37867890284" },
            { name: "Sealofapprovalis7628396t' S96t'", symbol: "S96t'", amount: "37867890284" },
            { name: "Bitcoinayt", symbol: "BTCYT", amount: "37867890284" },
            { name: "Bitcoin", symbol: "BTC", amount: "37867890284" },
            { name: "Global Transaction Payment Solution", symbol: "GTPS", amount: "37867890284" },
            { name: "AGT Gold", symbol: "AGOLD", amount: "37867890284" }
        ];

        initialTokens.forEach(token => {
            this.tokens.set(token.symbol, {
                name: token.name,
                symbol: token.symbol,
                totalSupply: BigInt(token.amount),
                decimals: 18,
                creator: "genesis"
            });
        });
    }

    // Wallet Management System
    createWallet(secretPhrase) {
        const address = this.generateAddress(secretPhrase);
        const wallet = {
            address: address,
            balances: new Map(),
            secretPhrase: secretPhrase,
            publicKey: this.generatePublicKey(secretPhrase)
        };

        // Initialize balances for all tokens
        for (let [symbol] of this.tokens) {
            wallet.balances.set(symbol, 0n);
        }

        this.wallets.set(address, wallet);
        return wallet;
    }

    generateAddress(secretPhrase) {
        // Simplified address generation (in real implementation use proper cryptography)
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(secretPhrase).digest('hex').slice(0, 52);
    }

    generatePublicKey(secretPhrase) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(secretPhrase + 'public').digest('hex');
    }

    // Token Management
    getTokenBalance(walletAddress, tokenSymbol) {
        const wallet = this.wallets.get(walletAddress);
        if (!wallet) return 0n;
        return wallet.balances.get(tokenSymbol) || 0n;
    }

    getAllBalances(walletAddress) {
        const wallet = this.wallets.get(walletAddress);
        if (!wallet) return null;

        const balances = {};
        for (let [symbol, balance] of wallet.balances) {
            balances[symbol] = balance.toString();
        }
        return balances;
    }

    // Transaction System
    createTransaction(fromAddress, toAddress, amount, tokenSymbol, secretPhrase) {
        // Verify sender identity
        const senderWallet = this.wallets.get(fromAddress);
        if (!senderWallet || senderWallet.secretPhrase !== secretPhrase) {
            throw new Error("Invalid wallet or secret phrase");
        }

        // Check balance
        const currentBalance = this.getTokenBalance(fromAddress, tokenSymbol);
        if (currentBalance < BigInt(amount)) {
            throw new Error("Insufficient balance");
        }

        const transaction = {
            fromAddress,
            toAddress,
            amount: BigInt(amount),
            tokenSymbol,
            timestamp: Date.now(),
            transactionId: this.generateTransactionId()
        };

        this.pendingTransactions.push(transaction);
        return transaction;
    }

    generateTransactionId() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    // Mining and Block Creation
    minePendingTransactions(miningRewardAddress) {
        const block = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousHash: this.getLatestBlock().hash,
            nonce: 0
        };

        block.hash = this.calculateHash(
            block.index,
            block.timestamp,
            block.transactions,
            block.previousHash,
            block.nonce
        );

        // Proof of Work
        while (block.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
            block.nonce++;
            block.hash = this.calculateHash(
                block.index,
                block.timestamp,
                block.transactions,
                block.previousHash,
                block.nonce
            );
        }

        // Process transactions and update balances
        this.processTransactions(block.transactions);

        // Add mining reward
        this.addMiningReward(miningRewardAddress);

        this.chain.push(block);
        this.pendingTransactions = [];

        return block;
    }

    processTransactions(transactions) {
        transactions.forEach(transaction => {
            const fromWallet = this.wallets.get(transaction.fromAddress);
            const toWallet = this.wallets.get(transaction.toAddress);

            if (fromWallet && toWallet) {
                // Deduct from sender
                const currentFromBalance = fromWallet.balances.get(transaction.tokenSymbol) || 0n;
                fromWallet.balances.set(transaction.tokenSymbol, currentFromBalance - transaction.amount);

                // Add to receiver
                const currentToBalance = toWallet.balances.get(transaction.tokenSymbol) || 0n;
                toWallet.balances.set(transaction.tokenSymbol, currentToBalance + transaction.amount);
            }
        });
    }

    addMiningReward(miningRewardAddress) {
        const rewardWallet = this.wallets.get(miningRewardAddress);
        if (rewardWallet) {
            const currentBalance = rewardWallet.balances.get("AGT") || 0n;
            rewardWallet.balances.set("AGT", currentBalance + BigInt(this.miningReward));
        }
    }

    // Utility Methods
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    calculateHash(index, timestamp, transactions, previousHash, nonce) {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
            .update(index + timestamp + JSON.stringify(transactions) + previousHash + nonce)
            .digest('hex');
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== this.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.transactions,
                currentBlock.previousHash,
                currentBlock.nonce
            )) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Smart Contract System for Token Operations
class AGTSmartContract {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.contracts = new Map();
    }

    deployTokenContract(name, symbol, totalSupply, creatorAddress) {
        const contract = {
            name,
            symbol,
            totalSupply: BigInt(totalSupply),
            creator: creatorAddress,
            holders: new Map(),
            functions: {
                transfer: this.transferTokens.bind(this),
                balanceOf: this.getTokenBalance.bind(this),
                totalSupply: () => totalSupply
            }
        };

        // Initialize creator with total supply
        contract.holders.set(creatorAddress, BigInt(totalSupply));
        this.contracts.set(symbol, contract);

        // Add to blockchain token registry
        this.blockchain.tokens.set(symbol, {
            name,
            symbol,
            totalSupply: BigInt(totalSupply),
            decimals: 18,
            creator: creatorAddress
        });

        return contract;
    }

    transferTokens(symbol, fromAddress, toAddress, amount) {
        const contract = this.contracts.get(symbol);
        if (!contract) throw new Error("Token contract not found");

        const fromBalance = contract.holders.get(fromAddress) || 0n;
        if (fromBalance < BigInt(amount)) throw new Error("Insufficient balance");

        contract.holders.set(fromAddress, fromBalance - BigInt(amount));
        const toBalance = contract.holders.get(toAddress) || 0n;
        contract.holders.set(toAddress, toBalance + BigInt(amount));

        return true;
    }

    getTokenBalance(symbol, address) {
        const contract = this.contracts.get(symbol);
        if (!contract) return 0n;
        return contract.holders.get(address) || 0n;
    }
}

// Implementation and Usage Example
const agtBlockchain = new AGTBlockchain();
const agtSmartContracts = new AGTSmartContract(agtBlockchain);

// Initialize your wallets (in a real system, you'd use proper key derivation)
const mySecretPhrase = "your-secret-phrase-here";
const myWallet = agtBlockchain.createWallet(mySecretPhrase);

const otherSecretPhrase = "other-secret-phrase";
const otherWallet = agtBlockchain.createWallet(otherSecretPhrase);

// Initialize token distribution (genesis allocation)
function initializeGenesisDistribution() {
    const genesisAllocation = {
        "AGT": "37867890284",
        "S96t'": "37867890284", 
        "BTCYT": "37867890284",
        "BTC": "37867890284",
        "GTPS": "37867890284",
        "AGOLD": "37867890284"
    };

    // Distribute to your wallet
    const myWalletInstance = agtBlockchain.wallets.get(myWallet.address);
    Object.entries(genesisAllocation).forEach(([symbol, amount]) => {
        myWalletInstance.balances.set(symbol, BigInt(amount));
    });
}

// Initialize the blockchain with your tokens
initializeGenesisDistribution();

// Example: Check balances
console.log("My Wallet Balances:", agtBlockchain.getAllBalances(myWallet.address));
console.log("Other Wallet Balances:", agtBlockchain.getAllBalances(otherWallet.address));

// Example: Create a transaction
try {
    const transaction = agtBlockchain.createTransaction(
        myWallet.address,
        otherWallet.address,
        "1000",
        "AGT",
        mySecretPhrase
    );
    console.log("Transaction created:", transaction);
} catch (error) {
    console.error("Transaction failed:", error.message);
}

// Mine transactions
const minedBlock = agtBlockchain.minePendingTransactions(myWallet.address);
console.log("Block mined:", minedBlock);

// Check updated balances
console.log("Updated My Balances:", agtBlockchain.getAllBalances(myWallet.address));
console.log("Updated Other Balances:", agtBlockchain.getAllBalances(otherWallet.address));

// Blockchain status
console.log("Blockchain valid:", agtBlockchain.isChainValid());
console.log("Blockchain length:", agtBlockchain.chain.length);
