NEW Proof of Life Node
const { AGTBlockchain } = require('./core/Blockchain');
const Wallet = require('./core/Wallet');

class LifeNode {
    constructor(secretPhrase, stakeAGT = 8000) {
        this.blockchain = new AGTBlockchain();
        this.wallet = new Wallet(secretPhrase);
        this.stakeAGT = stakeAGT;
        this.lifeExtension = null;
        this.mining = false;
        
        this.initializeLifeStake();
    }

    initializeLifeStake() {
        try {
            this.lifeExtension = this.blockchain.consensus.validateLifeStake(
                this.wallet.getAddress(),
                this.stakeAGT
            );
            console.log(`🧬 Life Node Initialized:`);
            console.log(`   Address: ${this.wallet.getAddress()}`);
            console.log(`   AGT Stake: ${this.stakeAGT.toLocaleString()}`);
            console.log(`   Life Extension: ${this.lifeExtension.lifeExtension.toLocaleString()} years`);
            console.log(`   Mining Power: ${this.lifeExtension.miningPower}x`);
            console.log(`   Equivalent Value: $${this.lifeExtension.equivalentValueUSD.toLocaleString()}`);
        } catch (error) {
            console.log(`❌ Life Stake Error: ${error.message}`);
        }
    }

    startMining() {
        this.mining = true;
        console.log(`⛏️ Starting Proof of Life Mining...`);
        
        this.mineLoop();
    }

    stopMining() {
        this.mining = false;
        console.log('🛑 Mining stopped');
    }

    mineLoop() {
        if (!this.mining) return;

        if (this.blockchain.pendingTransactions.length > 0) {
            console.log(`\n🔨 Mining block with ${this.blockchain.pendingTransactions.length} transactions...`);
            
            const block = this.blockchain.minePendingTransactions(
                this.wallet.getAddress(),
                this.stakeAGT
            );
            
            console.log(`✅ Block #${this.blockchain.chain.length - 1} mined!`);
            console.log(`💰 Reward: ${block.minerReward} AGT`);
            console.log(`🧬 Life Stake: ${this.lifeExtension.lifeExtension.toLocaleString()} years`);
        } else {
            console.log('⏳ No pending transactions to mine...');
        }

        // Continue mining after delay
        setTimeout(() => this.mineLoop(), 15000);
    }

    getNodeInfo() {
        return {
            address: this.wallet.getAddress(),
            lifeStake: this.lifeExtension,
            agtBalance: this.blockchain.getBalanceOfAddress(this.wallet.getAddress(), 'AGT'),
            goldInfo: this.blockchain.getGoldLiquidityInfo(),
            chainLength: this.blockchain.chain.length
        };
    }
}

// Example Life Node with your wallet
const myLifeNode = new LifeNode("your-secret-phrase-here", 8000);

console.log('\n💰 Gold Backing Information:');
console.log(JSON.stringify(myLifeNode.blockchain.getGoldLiquidityInfo(), null, 2));

console.log('\n🧬 Starting Proof of Life Node...');
myLifeNode.startMining();

module.exports = LifeNode;
