const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { Transaction } = require('./Blockchain');

class Wallet {
    constructor(secretPhrase = '') {
        if (secretPhrase) {
            this.key = ec.keyFromPrivate(CryptoJS.SHA256(secretPhrase).toString());
        } else {
            this.key = ec.genKeyPair();
        }
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.address = this.generateAddress();
    }

    generateAddress() {
        return CryptoJS.SHA256(this.publicKey).toString().slice(0, 52);
    }

    sign(data) {
        return this.key.sign(data);
    }

    createTransaction(toAddress, amount, tokenSymbol, blockchain, gasFee = 10) {
        const tx = new Transaction(this.address, toAddress, amount, tokenSymbol, gasFee);
        tx.signTransaction(this.key);
        return tx;
    }

    getAddress() {
        return this.address;
    }

    getPublicKey() {
        return this.publicKey;
    }
}

module.exports = Wallet;
