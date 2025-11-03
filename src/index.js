const { EnhancedBlockchain } = require('./core/EnhancedBlockchain');
const express = require('express');
const bodyParser = require('body-parser');

class AGTBlockchainNetwork {
    constructor() {
        this.blockchain = new EnhancedBlockchain();
        this.app = express();
        this.setupExpress();
    }

    setupExpress() {
        this.app.use(bodyParser.json());

        // Wallet endpoints
        this.app.get('/wallet/my-portfolio', (req, res) => {
            const portfolio = this.blockchain.getYourWallet();
            res.json(portfolio);
        });

        this.app.get('/wallet/:address', (req, res) => {
            const wallet = this.blockchain.getWalletDetails(req.params.address);
            if (!wallet) {
                return res.status(404).json({ error: 'Wallet not found' });
            }
            res.json(wallet);
        });

        // Transaction endpoints
        this.app.post('/transaction/create', (req, res) => {
            try {
                const { fromAddress, toAddress, amount, tokenSymbol, privateKey } = req.body;
                
                // In real implementation, verify private key and sign transaction
                const transaction = {
                    fromAddress,
                    toAddress,
                    amount: parseInt(amount),
                    tokenSymbol,
                    timestamp: Date.now()
                };

                // Add to pending transactions
                this.blockchain.addTransaction(transaction);
                
                res.json({
                    transactionId: `tx_${Date.now()}`,
                    status: 'pending',
                    token: tokenSymbol,
                    amount: amount
                });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Blockchain info endpoints
        this.app.get('/blockchain/info', (req, res) => {
            res.json({
                blocks: this.blockchain.chain.length,
                difficulty: this.blockchain.difficulty,
                pendingTransactions: this.blockchain.pendingTransactions.length,
                network: 'AGT Blockchain',
                consensus: 'Proof of Life'
            });
        });

        this.app.get('/tokens', (req, res) => {
            const tokens = this.blockchain.getAllTokens();
            res.json(tokens);
        });

        // Gold backing endpoints
        this.app.get('/gold/backing', (req, res) => {
            const goldInfo = this.blockchain.goldContract.getContractState();
            res.json(goldInfo);
        });

        this.app.get('/gold/vouchers', (req, res) => {
            const vouchers = this.blockchain.goldContract.goldVoucherSystem.vouchers;
            res.json(vouchers);
        });

        // Mining endpoint
        this.app.post('/mine', (req, res) => {
            const { minerAddress, lifeStake } = req.body;
            const block = this.blockchain.minePendingTransactions(minerAddress, lifeStake || 0);
            res.json({ 
                message: 'Block mined successfully',
                blockNumber: this.blockchain.chain.length - 1,
                reward: block.minerReward,
                lifeStake: block.lifeStake
            });
        });

        // Life extension calculator
        this.app.get('/life/calculate/:address', (req, res) => {
            const agtBalance = this.blockchain.getBalanceOfAddress(req.params.address, 'AGT');
            const lifeExtension = this.blockchain.consensus.calculateLifeExtension(agtBalance);
            res.json(lifeExtension);
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`🧬 AGT Blockchain running on port ${port}`);
            console.log('='.repeat(60));
            console.log('Advanced Genetic Synthesis Technology Blockchain');
            console.log('Proof of Life Consensus • Gold-Backed Tokens');
            console.log('='.repeat(60));
            
            // Display wallet information
            const walletInfo = this.blockchain.getYourWallet();
            console.log(`\n💰 Your Wallet: ${walletInfo.address}`);
            console.log(`📊 Portfolio Value: $${walletInfo.portfolioValueUSD.toLocaleString()}`);
            console.log(`🧬 Life Extension: ${walletInfo.lifeExtension.years.toLocaleString()} years`);
            
            console.log('\n🪙 Token Balances:');
            Object.entries(walletInfo.balances).forEach(([symbol, balance]) => {
                console.log(`  ${symbol}: ${balance.toLocaleString()} tokens`);
            });

            console.log('\n🏦 Gold Backing Verified:');
            console.log(`  Total Gold Reserves: $${this.blockchain.goldContract.goldVoucherSystem.totalGoldBackingUSD.toLocaleString()}`);
            console.log(`  Indian Reserve Voucher: $${this.blockchain.goldContract.goldVoucherSystem.vouchers.indianReserve.amountUSD.toLocaleString()}`);
            console.log(`  American Reserve Voucher: $${this.blockchain.goldContract.goldVoucherSystem.vouchers.americanReserve.amountUSD.toLocaleString()}`);

            console.log(`\n🌐 API endpoints available at http://localhost:${port}`);
        });
    }
}

// Start the network
const agtNetwork = new AGTBlockchainNetwork();
agtNetwork.start(3000);

module.exports = AGTBlockchainNetwork;
