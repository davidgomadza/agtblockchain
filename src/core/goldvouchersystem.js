const CryptoJS = require('crypto-js');

class GoldVoucherSystem {
    constructor() {
        this.vouchers = {
            indianReserve: {
                voucherNumber: "28678902843867890285176283280davidgomadza",
                amountUSD: 2000000000, // $2 billion
                bank: "Reserve Bank of India",
                verified: true,
                verificationHash: this.generateVerificationHash("28678902843867890285176283280davidgomadza")
            },
            americanReserve: {
                voucherNumber: "286789071853824867890856321481792davidgomadza", 
                amountUSD: 2000000000, // $2 billion
                bank: "American Reserve Bank",
                verified: true,
                verificationHash: this.generateVerificationHash("286789071853824867890856321481792davidgomadza")
            }
        };
        
        this.totalGoldBackingUSD = 11018000000000 + 27000000000; // $11.018T + $27B
        this.tokenAllocations = new Map();
        this.backingRatios = new Map();
        
        this.initializeTokenBacking();
    }

    generateVerificationHash(voucherNumber) {
        return CryptoJS.SHA256(voucherNumber).toString();
    }

    initializeTokenBacking() {
        const totalTokens = 37867890284;
        
        // Calculate backing per token
        const backingPerToken = this.totalGoldBackingUSD / totalTokens;
        
        // Distribute gold backing across all tokens
        this.tokenAllocations.set('AGT', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.4, // 40% to AGT
            valuePerToken: (this.totalGoldBackingUSD * 0.4) / totalTokens
        });

        this.tokenAllocations.set('AGOLD', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.3, // 30% to AGOLD
            valuePerToken: (this.totalGoldBackingUSD * 0.3) / totalTokens
        });

        this.tokenAllocations.set('BTCYT', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.1, // 10% to BTCYT
            valuePerToken: (this.totalGoldBackingUSD * 0.1) / totalTokens
        });

        this.tokenAllocations.set('S96t\'', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.08, // 8% to S96t'
            valuePerToken: (this.totalGoldBackingUSD * 0.08) / totalTokens
        });

        this.tokenAllocations.set('BTC', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.07, // 7% to BTC
            valuePerToken: (this.totalGoldBackingUSD * 0.07) / totalTokens
        });

        this.tokenAllocations.set('GTPS', {
            tokens: totalTokens,
            goldBackingUSD: this.totalGoldBackingUSD * 0.05, // 5% to GTPS
            valuePerToken: (this.totalGoldBackingUSD * 0.05) / totalTokens
        });
    }

    verifyVoucher(voucherNumber) {
        if (voucherNumber === this.vouchers.indianReserve.voucherNumber) {
            return {
                valid: true,
                voucher: this.vouchers.indianReserve,
                verificationHash: this.vouchers.indianReserve.verificationHash
            };
        }
        
        if (voucherNumber === this.vouchers.americanReserve.voucherNumber) {
            return {
                valid: true, 
                voucher: this.vouchers.americanReserve,
                verificationHash: this.vouchers.americanReserve.verificationHash
            };
        }
        
        return { valid: false, error: "Invalid voucher number" };
    }

    getTokenBackingInfo(tokenSymbol) {
        const allocation = this.tokenAllocations.get(tokenSymbol);
        if (!allocation) {
            throw new Error(`Token ${tokenSymbol} not found in gold backing system`);
        }

        return {
            token: tokenSymbol,
            totalTokens: allocation.tokens,
            goldBackingUSD: allocation.goldBackingUSD,
            valuePerToken: allocation.valuePerToken,
            backingPercentage: (allocation.goldBackingUSD / this.totalGoldBackingUSD) * 100,
            verifiedVouchers: Object.values(this.vouchers).filter(v => v.verified)
        };
    }

    getAllTokenBackings() {
        const backings = {};
        for (let [symbol] of this.tokenAllocations) {
            backings[symbol] = this.getTokenBackingInfo(symbol);
        }
        return backings;
    }

    calculateTotalPortfolioValue(walletBalances) {
        let totalValueUSD = 0;
        const tokenValues = {};

        for (const [symbol, balance] of Object.entries(walletBalances)) {
            const backing = this.tokenAllocations.get(symbol);
            if (backing) {
                const tokenValue = balance * backing.valuePerToken;
                tokenValues[symbol] = tokenValue;
                totalValueUSD += tokenValue;
            }
        }

        return {
            totalValueUSD,
            tokenValues,
            goldBackedPercentage: 100 // All tokens are gold-backed
        };
    }

    getSystemSummary() {
        return {
            totalGoldBackingUSD: this.totalGoldBackingUSD,
            verifiedVouchers: Object.values(this.vouchers),
            totalTokens: 37867890284,
            tokensBacked: Array.from(this.tokenAllocations.keys()),
            backingDistribution: Object.fromEntries(this.tokenAllocations)
        };
    }
}

module.exports = GoldVoucherSystem;
