const { AGTBlockchain } = require('./core/Blockchain');
const Wallet = require('./core/Wallet');

class Miner {
    constructor(blockchain, minerAddress) {
        this.blockchain = blockchain;
        this.minerAddress = minerAddress;
        this.mining = false;
    }

    startMining() {
        this.mining = true;
        console.log(`Miner started for address: ${this.minerAddress}`);
        
        this.mineLoop();
    }

    stopMining() {
        this.mining = false;
        console.log('Miner stopped');
    }

    mineLoop() {
        if (!this.mining) return;

        if (this.blockchain.pendingTransactions.length > 0) {
            console.log('Mining block with', this.blockchain.pendingTransactions.length, 'transactions');
            this.blockchain.minePendingTransactions(this.minerAddress);
            console.log('Block mined! Reward:', this.blockchain.miningReward, 'AGT');
        } else {
            console.log('No pending transactions to mine');
        }

        // Continue mining after delay
        setTimeout(() => this.mineLoop(), 10000);
    }
}

// Example miner setup
const blockchain = new AGTBlockchain();
const minerWallet = new Wallet("miner-secret-phrase");
const miner = new Miner(blockchain, minerWallet.getAddress());

console.log('Starting AGT Blockchain Miner...');
console.log('Miner Address:', minerWallet.getAddress());
miner.startMining();

module.exports = Miner;
