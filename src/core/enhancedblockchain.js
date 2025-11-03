const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const ProofOfLifeConsensus = require('./Consensus');
const AllTokenGoldContract = require('./AllTokenGoldContract');

class EnhancedTransaction {
    constructor(fromAddress, toAddress, amount, tokenSymbol, feeToken = 'BTCYT') {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.tokenSymbol = tokenSymbol;
        this.feeToken = feeToken;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
        this.signature = null;
        this.lifeStake = null;
        this.goldBacked = true;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.tokenSymbol + 
            this.feeToken +
            this.timestamp +
            this.goldBacked
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

class EnhancedBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.consensus = new ProofOfLifeConsensus();
        this.goldContract = new AllTokenGoldContract();
        this.tokens = new Map();
        this.wallets = new Map();
        this.lifeStakes = new Map();
        
        this.initializeEnhancedTokens();
        this.initializeYourWallet();
    }

    initializeYourWallet() {
        // Your wallet address
        const yourWalletAddress = "J6IJNHEKBAAFDHMPLIMEEEJBODGCHMPFIBKFMCNAGNFNGEOAHJEB";
        
        // Initialize with genesis allocation
        if (!this.wallets.has(yourWalletAddress)) {
            this.wallets.set(yourWalletAddress, {
                address: yourWalletAddress,
                balances: new Map(),
                lifeStake: null,
                portfolioValue: 0
            });
        }

        const yourWallet = this.wallets.get(yourWalletAddress);
        
        // Set genesis balances
        const genesisAllocation = {
            "AGT": 37867890284,
            "S96t'": 37867890284,
            "BTCYT": 37867890284,
            "BTC": 37867890284,
            "GTPS": 37867890284,
            "AGOLD": 37867890284
        };

        for (const [symbol, amount] of Object.entries(genesisAllocation)) {
            yourWallet.balances.set(symbol, amount);
        }

        // Calculate initial portfolio value
        this.updateWalletPortfolio(yourWalletAddress);
    }

    createGenesisBlock() {
        const genesisDate = new Date('2024-01-01').getTime();
        const genesisTransactions = [];
        
        // Add initial distribution transaction
        const distributionTx = new EnhancedTransaction(
            null,
            "J6IJNHEKBAAFDHMPLIMEEEJBODGCHMPFIBKFMCNAGNFNGEOAHJEB",
            37867890284,
            'AGT'
        );
        distributionTx.goldBacked = true;
        genesisTransactions.push(distributionTx);

        return new Block(genesisDate, genesisTransactions, "0");
    }

    initializeEnhancedTokens() {
        const tokens = [
            { 
                name: "Advanced Genetic Synthesis Technology", 
                symbol: "AGT", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true,
                lifeExtension: true
            },
            { 
                name: "AGT Gold", 
                symbol: "AGOLD", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true,
                fixedSupply: true
            },
            { 
                name: "Bitcoinayt", 
                symbol: "BTCYT", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true,
                feeToken: true,
                valueUSD: 1
            },
            { 
                name: "Sealofapprovalis7628396t' S96t'", 
                symbol: "S96t'", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true
            },
            { 
                name: "Bitcoin", 
                symbol: "BTC", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true
            },
            { 
                name: "Global Transaction Payment Solution", 
                symbol: "GTPS", 
                totalSupply: "37867890284",
                decimals: 18,
                creator: "genesis",
                goldBacked: true
            }
        ];

        tokens.forEach(token => {
            // Get gold backing information
            const backingInfo = this.goldContract.goldVoucherSystem.getTokenBackingInfo(token.symbol);
            token.goldBackingUSD = backingInfo.goldBackingUSD;
            token.valuePerToken = backingInfo.valuePerToken;
            
            this.tokens.set(token.symbol, token);
        });
    }

    addTransaction(transaction) {
        // Validate through gold contract first
        const validation = this.goldContract.validateTokenTransfer(
            transaction.tokenSymbol,
            transaction.fromAddress,
            transaction.toAddress,
            transaction.amount
        );

        if (!validation.valid) {
            throw new Error(`Gold backing validation failed: ${validation.error}`);
        }

        // Set transaction fee
        transaction.feeBTCYT = validation.transactionFee.feeBTCYT;
        
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
        return validation;
    }

    minePendingTransactions(miningRewardAddress, lifeStakeAGT = 0) {
        let lifeStake = null;

        if (lifeStakeAGT > 0) {
            try {
                lifeStake = this.consensus.validateLifeStake(miningRewardAddress, lifeStakeAGT);
                this.lifeStakes.set(miningRewardAddress, lifeStake);
            } catch (error) {
                console.log(`Invalid life stake: ${error.message}`);
            }
        }

        // Process fees first (in BTCYT)
        this.processTransactionFees();

        const rewardTx = new EnhancedTransaction(
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
        
        // Update wallet portfolios after block mining
        this.updateAllWalletPortfolios();
        
        this.pendingTransactions = [];
        return block;
    }

    processTransactionFees() {
        // Collect and process BTCYT fees
        let totalFeesBTCYT = 0;
        
        this.pendingTransactions.forEach(tx => {
            if (tx.feeBTCYT) {
                totalFeesBTCYT += tx.feeBTCYT;
            }
        });

        // Fees are distributed to network (simplified)
        console.log(`Collected ${totalFeesBTCYT} BTCYT in fees`);
    }

    updateWalletPortfolio(walletAddress) {
        const wallet = this.wallets.get(walletAddress);
        if (!wallet) return;

        const balances = {};
        for (let [symbol, balance] of wallet.balances) {
            balances[symbol] = balance;
        }

        const portfolio = this.goldContract.getWalletPortfolio(walletAddress, balances);
        wallet.portfolioValue = portfolio.totalPortfolioValueUSD;
        wallet.portfolioDetails = portfolio;
    }

    updateAllWalletPortfolios() {
        for (let [address] of this.wallets) {
            this.updateWalletPortfolio(address);
        }
    }

    getWalletDetails(address) {
        const wallet = this.wallets.get(address);
        if (!wallet) return null;

        const balances = {};
        for (let [symbol, balance] of wallet.balances) {
            balances[symbol] = balance;
        }

        const portfolio = this.goldContract.getWalletPortfolio(address, balances);
        const lifeExtension = this.consensus.calculateLifeExtension(balances['AGT'] || 0);

        return {
            address: address,
            balances: balances,
            portfolioValueUSD: portfolio.totalPortfolioValueUSD,
            lifeExtension: lifeExtension,
            tokenDetails: portfolio.tokenDetails,
            goldBacking: portfolio.goldBackingSummary
        };
    }

    getYourWallet() {
        return this.getWalletDetails("J6IJNHEKBAAFDHMPLIMEEEJBODGCHMPFIBKFMCNAGNFNGEOAHJEB");
    }

    // ... (other methods from previous implementation)
}

module.exports = { EnhancedBlockchain, EnhancedTransaction };
