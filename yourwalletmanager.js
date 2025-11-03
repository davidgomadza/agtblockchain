const { EnhancedBlockchain } = require('./core/EnhancedBlockchain');

class YourWalletManager {
    constructor() {
        this.blockchain = new EnhancedBlockchain();
        this.yourAddress = "J6IJNHEKBAAFDHMPLIMEEEJBODGCHMPFIBKFMCNAGNFNGEOAHJEB";
    }

    getCompletePortfolio() {
        const walletInfo = this.blockchain.getYourWallet();
        const goldContract = this.blockchain.goldContract;
        
        console.log("=".repeat(80));
        console.log("🧬 YOUR AGT BLOCKCHAIN PORTFOLIO");
        console.log("=".repeat(80));
        
        console.log(`\n📍 Wallet Address: ${this.yourAddress}`);
        console.log(`💰 Total Portfolio Value: $${walletInfo.portfolioValueUSD.toLocaleString()}`);
        
        console.log("\n📊 TOKEN BALANCES & GOLD BACKING:");
        console.log("-".repeat(60));
        
        for (const [symbol, details] of Object.entries(walletInfo.tokenDetails)) {
            console.log(`\n${symbol}:`);
            console.log(`  Balance: ${details.balance.toLocaleString()} tokens`);
            console.log(`  Value: $${details.totalValue.toLocaleString()}`);
            console.log(`  Per Token: $${details.valuePerToken.toFixed(2)}`);
            console.log(`  Gold Backing: $${details.goldBacking.toLocaleString()}`);
        }

        console.log("\n🧬 LIFE EXTENSION INFORMATION:");
        console.log("-".
