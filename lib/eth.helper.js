const Web3 = require("web3");
const Config = require("../config/ethereum");
var Tx = require('ethereumjs-tx');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(Config.rpc));

var eth = {};

eth.sendTransaction = (from, to, amount) => {
    return web3.eth.sendTransaction({
        from: from,
        to: to,
        value: amount
    });
};

eth.sendRawTransaction = (fromAccount, privateKey, toAccount, amount) => {
    privateKey = new Buffer(privateKey, 'hex');

    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(fromAccount)),
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(3500000),
        to: toAccount,
        from: fromAccount,
        value: web3.toHex(web3.toWei(amount, 'ether')),
        data: ""
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    var serializedTx = tx.serialize();
    return web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'));
};

eth.getTransactionFromBlock = (block) => {
    return web3.eth.getTransactionFromBlock(block);
};

eth.getReceipt = (hash) => {
    return web3.eth.getTransactionReceipt(hash);
};

eth.getBalance = (account) => {
    return web3.eth.getBalance(account);
};

module.exports = eth;