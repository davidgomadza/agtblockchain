const { AGTBlockchain, Transaction } = require('./core/Blockchain');
const Wallet = require('./core/Wallet');
const AGTSmartContract = require('./core/SmartContract');
const express = require('express');
const bodyParser = require('body-parser');

class AGTBlockchainNetwork {
    constructor() {
        this.blockchain = new AGTBlockchain();
        this.smartContracts = new AGTSmartContract(this.blockchain);
        this.wallets = new Map();
        this.app = express();
        this.setupExpress();
    }

    setupExpress() {
        this.app.use(bodyParser.json());

        // Wallet endpoints
        this.app.post('/wallet/create', (req, res) => {
            const wallet = new Wallet();
            this.wallets.set(wallet.address, wallet);
            res.json({
                address: wallet.address,
                publicKey: wallet.getPublicKey()
            });
        });

        this.app.post('/wallet/import', (req, res) => {
            const { secretPhrase } = req.body;
            const wallet = new Wallet(secretPhrase);
            this.wallets.set(wallet.address, wallet);
            res.json({ address: wallet.address });
        });

        // Transaction endpoints
        this.app.post('/transaction/create', (req, res) => {
            try {
                const { fromAddress, toAddress, amount, tokenSymbol, privateKey } = req.body;
                
                const wallet = this.wallets.get(fromAddress);
                if (!wallet) {
                    return res.status(400).json({ error: 'Wallet not found' });
                }

                const tx = wallet.createTransaction(toAddress, amount, tokenSymbol, this.blockchain);
                this.blockchain.addTransaction(tx);

                res.json({
                    transactionId: tx.hash,
                    status: 'pending'
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
                pendingTransactions: this.blockchain.pendingTransactions.length
            });
        });

        this.app.get('/wallet/:address/balance', (req, res) => {
            const balances = this.blockchain.getAllBalances(req.params.address);
            res.json(balances);
        });

        this.app.get('/tokens', (req, res) => {
            const tokens = this.blockchain.getAllTokens();
            res.json(tokens);
        });

        // Mining endpoint
        this.app.post('/mine', (req, res) => {
            const { minerAddress } = req.body;
            this.blockchain.minePendingTransactions(minerAddress);
            res.json({ 
                message: 'Block mined successfully',
                blockNumber: this.blockchain.chain.length - 1
            });
        });

        // Smart contract endpoints
        this.app.post('/contract/deploy', (req, res) => {
            try {
                const { name, symbol, totalSupply, creatorAddress } = req.body;
                const result = this.smartContracts.deployTokenContract(
                    name, symbol, totalSupply, creatorAddress
                );
                res.json(result);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`AGT Blockchain running on port ${port}`);
            console.log('Advanced Genetic Synthesis Technology Blockchain');
            console.log('Multi-token ecosystem initialized with:');
            this.blockchain.getAllTokens().forEach(token => {
                console.log(`  - ${token.symbol}: ${token.name}`);
            });
        });
    }
}

// Initialize and start the network
const agtNetwork = new AGTBlockchainNetwork();

// Example initialization with your wallets
const myWallet = new Wallet("your-secret-phrase-here");
const otherWallet = new Wallet("other-secret-phrase");

console.log("Your Wallet Address:", myWallet.getAddress());
console.log("Other Wallet Address:", otherWallet.getAddress());

// Start the network
agtNetwork.start(3000);

module.exports = AGTBlockchainNetwork;
