const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount, tokenSymbol, gasFee = 0) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.tokenSymbol = tokenSymbol;
        this.gasFee = gasFee;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
        this.signature = null;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.tokenSymbol + 
            this.timestamp
        ).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true; // Mining reward

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class AGTBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.tokens = new Map();
        this.wallets = new Map();
        
        this.initializeTokens();
    }

    createGenesisBlock() {
        const genesisDate = new Date('2024-01-01').getTime();
        return new Block(genesisDate, [], "0");
    }

    initializeTokens() {
        const genesisTokens = [
            { 
                name: "Advanced Genetic Synthesis Technology", 
                symbol: "AGT", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            },
            { 
                name: "Sealofapprovalis7628396t' S96t'", 
                symbol: "S96t'", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            },
            { 
                name: "Bitcoinayt", 
                symbol: "BTCYT", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            },
            { 
                name: "Bitcoin", 
                symbol: "BTC", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            },
            { 
                name: "Global Transaction Payment Solution", 
                symbol: "GTPS", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            },
            { 
                name: "AGT Gold", 
                symbol: "AGOLD", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis"
            }
        ];

        genesisTokens.forEach(token => {
            this.tokens.set(token.symbol, token);
        });
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(
            null,
            miningRewardAddress,
            this.miningReward,
            'AGT'
        );
        this.pendingTransactions.push(rewardTx);

        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        // Check token exists
        if (!this.tokens.has(transaction.tokenSymbol)) {
            throw new Error(`Token ${transaction.tokenSymbol} does not exist`);
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address, tokenSymbol = 'AGT') {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address && trans.tokenSymbol === tokenSymbol) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address && trans.tokenSymbol === tokenSymbol) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    getAllBalances(address) {
        const balances = {};
        for (const [symbol] of this.tokens) {
            balances[symbol] = this.getBalanceOfAddress(address, symbol);
        }
        return balances;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getTokenInfo(symbol) {
        return this.tokens.get(symbol);
    }

    getAllTokens() {
        return Array.from(this.tokens.values());
    }
}

module.exports = { AGTBlockchain, Transaction, Block };
