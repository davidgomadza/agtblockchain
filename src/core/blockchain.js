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
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const ProofOfLifeConsensus = require('./Consensus');
const GoldLiquidityContract = require('./GoldLiquidityContract');

class Transaction {
    constructor(fromAddress, toAddress, amount, tokenSymbol, gasFee = 0, feeToken = 'BTCYT') {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.tokenSymbol = tokenSymbol;
        this.gasFee = gasFee;
        this.feeToken = feeToken;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
        this.signature = null;
        this.lifeStake = null;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.tokenSymbol + 
            this.gasFee +
            this.feeToken +
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

    setLifeStake(lifeStake) {
        this.lifeStake = lifeStake;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '', lifeStake) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.lifeStake = lifeStake; // Proof of Life stake
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.minerReward = 0;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce +
            (this.lifeStake ? JSON.stringify(this.lifeStake) : '')
        ).toString();
    }

    mineBlock(difficulty, consensus) {
        const lifeStake = this.lifeStake;
        let miningPower = 1;

        if (lifeStake && lifeStake.miningPower) {
            miningPower = lifeStake.miningPower;
            console.log(`Mining with Life Stake: ${lifeStake.lifeExtension} years extension (Power: ${miningPower}x)`);
        }

        // Adjust difficulty based on life stake
        const adjustedDifficulty = Math.max(1, Math.floor(difficulty / miningPower));

        while (this.hash.substring(0, adjustedDifficulty) !== Array(adjustedDifficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        // Calculate mining reward based on life stake
        if (lifeStake) {
            this.minerReward = consensus.calculateMiningReward(lifeStake);
        } else {
            this.minerReward = 100; // Default reward
        }

        console.log(`Block mined: ${this.hash} | Reward: ${this.minerReward} AGT | Life Stake: ${lifeStake ? lifeStake.lifeExtension + ' years' : 'None'}`);
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
        this.consensus = new ProofOfLifeConsensus();
        this.goldContract = new GoldLiquidityContract();
        this.tokens = new Map();
        this.wallets = new Map();
        this.lifeStakes = new Map(); // Track life stakes for mining
        
        this.initializeTokens();
        this.goldContract.initializeLiquidity();
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
                creator: "genesis",
                valueUSD: this.consensus.agtValuePerUnit
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
                creator: "genesis",
                valueUSD: 1 // $1 per BTCYT
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
                creator: "genesis",
                goldBacked: true,
                valueUSD: this.goldContract.getAGOLDValueUSD()
            }
        ];

        genesisTokens.forEach(token => {
            this.tokens.set(token.symbol, token);
        });
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Proof of Life Mining
    minePendingTransactions(miningRewardAddress, lifeStakeAGT = 0) {
        let lifeStake = null;

        // Validate life stake for mining
        if (lifeStakeAGT > 0) {
            try {
                lifeStake = this.consensus.validateLifeStake(miningRewardAddress, lifeStakeAGT);
                this.lifeStakes.set(miningRewardAddress, lifeStake);
            } catch (error) {
                console.log(`Invalid life stake: ${error.message}`);
            }
        }

        const rewardTx = new Transaction(
            null,
            miningRewardAddress,
            lifeStake ? this.consensus.calculateMiningReward(lifeStake) : 100,
            'AGT'
        );
        this.pendingTransactions.push(rewardTx);

        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash,
            lifeStake
        );
        
        block.mineBlock(this.difficulty, this.consensus);
        this.chain.push(block);
        this.pendingTransactions = [];

        return block;
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

        // Validate AGOLD transfers through gold contract
        if (transaction.tokenSymbol === 'AGOLD') {
            this.goldContract.validateAGOLDTransfer(
                transaction.fromAddress,
                transaction.toAddress,
                transaction.amount
            );
        }

        // Calculate and set fee in BTCYT
        const fee = this.consensus.calculateTransactionFee(JSON.stringify(transaction).length);
        transaction.gasFee = fee.btcyt;
        transaction.feeToken = 'BTCYT';

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

    // Life extension calculations
    calculateLifeExtension(address) {
        const agtBalance = this.getBalanceOfAddress(address, 'AGT');
        return this.consensus.calculateLifeExtension(agtBalance);
    }

    // Gold contract access
    getGoldLiquidityInfo() {
        return this.goldContract.getContractState();
    }

    getAGOLDValue() {
        return this.goldContract.getAGOLDValueUSD();
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
