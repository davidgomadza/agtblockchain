const { AGTBlockchain, Transaction } = require('../src/core/Blockchain');
const Wallet = require('../src/core/Wallet');

describe('AGT Blockchain', () => {
    let blockchain;
    let walletA;
    let walletB;

    beforeEach(() => {
        blockchain = new AGTBlockchain();
        walletA = new Wallet();
        walletB = new Wallet();
    });

    test('should create genesis block', () => {
        expect(blockchain.chain[0].previousHash).toBe('0');
    });

    test('should validate chain', () => {
        expect(blockchain.isChainValid()).toBe(true);
    });

    test('should create and process transactions', () => {
        const tx = new Transaction(
            walletA.getAddress(),
            walletB.getAddress(),
            100,
            'AGT'
        );
        tx.signTransaction(walletA.key);

        blockchain.addTransaction(tx);
        blockchain.minePendingTransactions(walletA.getAddress());

        const balanceA = blockchain.getBalanceOfAddress(walletA.getAddress(), 'AGT');
        const balanceB = blockchain.getBalanceOfAddress(walletB.getAddress(), 'AGT');

        expect(balanceB).toBe(100);
    });

    test('should have all tokens initialized', () => {
        const tokens = blockchain.getAllTokens();
        expect(tokens.length).toBe(6);
        expect(tokens.find(t => t.symbol === 'AGT')).toBeDefined();
        expect(tokens.find(t => t.symbol === 'AGOLD')).toBeDefined();
    });
});
