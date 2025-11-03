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
            deployedAt: Date.now(),
            holders: new Map([[creatorAddress, BigInt(totalSupply)]]),
            functions: {
                transfer: 'function transfer(address to, uint amount)',
                balanceOf: 'function balanceOf(address owner) view returns (uint)',
                totalSupply: 'function totalSupply() view returns (uint)'
            }
        };

        this.contracts.set(symbol, contract);

        // Register token in blockchain
        this.blockchain.tokens.set(symbol, {
            name,
            symbol,
            totalSupply: BigInt(totalSupply),
            decimals: 18,
            creator: creatorAddress
        });

        return {
            contractAddress: this.generateContractAddress(symbol),
            symbol,
            deployed: true
        };
    }

    generateContractAddress(symbol) {
        return `CONTRACT_${symbol}_${Date.now()}`;
    }

    executeContract(symbol, functionName, params, callerAddress) {
        const contract = this.contracts.get(symbol);
        if (!contract) {
            throw new Error(`Contract ${symbol} not found`);
        }

        switch (functionName) {
            case 'transfer':
                return this.transferTokens(contract, callerAddress, params.to, params.amount);
            case 'balanceOf':
                return this.getBalance(contract, params.owner);
            case 'totalSupply':
                return contract.totalSupply;
            default:
                throw new Error(`Function ${functionName} not found`);
        }
    }

    transferTokens(contract, from, to, amount) {
        const fromBalance = contract.holders.get(from) || 0n;
        const amountBig = BigInt(amount);

        if (fromBalance < amountBig) {
            throw new Error('Insufficient balance');
        }

        contract.holders.set(from, fromBalance - amountBig);
        const toBalance = contract.holders.get(to) || 0n;
        contract.holders.set(to, toBalance + amountBig);

        return {
            success: true,
            from: from,
            to: to,
            amount: amount.toString()
        };
    }

    getBalance(contract, address) {
        return (contract.holders.get(address) || 0n).toString();
    }

    getContract(symbol) {
        return this.contracts.get(symbol);
    }
}

module.exports = AGTSmartContract;
