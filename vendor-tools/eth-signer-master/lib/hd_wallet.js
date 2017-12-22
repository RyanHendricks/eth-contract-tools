var util = require("ethereumjs-util");
var Phrase = require('./generators/phrase');
var KeyPair = require('./generators/key_pair');
var HDSigner = require('./hd_signer');
var Transaction = require('ethereumjs-tx');

var HDWallet = function(hdSeed, initAccounts = 1) {
  this.hdSeed = Phrase.toHDPrivateKey(hdSeed);
  this.hdSigners = [];
  var key;
  for (var i = 0 ; i < initAccounts ; i++) {
    this.hdSigners[i] = new HDSigner(this.hdSeed,i);
  }
}

HDWallet.prototype.addAccounts = function(numAccounts = 1) {
  var totalNumAccounts = numAccounts + this.hdSigners.length
  for (var i = this.hdSigners.length ; i < totalNumAccounts ; i++) {
    this.hdSigners[i] = new HDSigner(this.hdSeed,i);
  }
};

HDWallet.prototype.hasAddress = function(address, callback) {
  callback(null, this.indexOfSigner(address) !== -1)
};

HDWallet.prototype.getAddress = function(i = 0) {
    if(!this.hdSigners[i]) {return new Error("address " + i + " doesnt exist")}
    return this.hdSigners[i].getAddress()
}

HDWallet.prototype.getAccounts = function(callback = function(e,r){return r}) {
  callback(null, this.getAddresses());
}

HDWallet.prototype.getAddresses = function() {
  var addresses = []
  for (var i = 0 ; i < this.hdSigners.length ; i++) {
    addresses.push(this.getAddress(i))
  }
  return addresses;
}

HDWallet.prototype.signTransaction = function (txParams, callback) {
  var ethjsTxParams = {};
  ethjsTxParams.from = util.addHexPrefix(txParams.from);
  ethjsTxParams.to = util.addHexPrefix(txParams.to);
  ethjsTxParams.gasLimit = util.addHexPrefix(txParams.gas);
  ethjsTxParams.gasPrice = util.addHexPrefix(txParams.gasPrice);
  ethjsTxParams.nonce = util.addHexPrefix(txParams.nonce);
  ethjsTxParams.value = util.addHexPrefix(txParams.value);
  ethjsTxParams.data = util.addHexPrefix(txParams.data);

  var senderAddress = ethjsTxParams.from; 
  var txObj = new Transaction(ethjsTxParams);
  var rawTx = txObj.serialize().toString('hex');
  this.signRawTx(rawTx, senderAddress, function(e,signedTx) {
    if (e)
      callback(e,null)
    else
      callback(null, '0x' + signedTx);
  });
};

HDWallet.prototype.signRawTx = function(rawTx, senderAddress, callback) {
  var index = this.indexOfSigner(senderAddress);
  if (index === -1) return callback(new Error("address not managed by this wallet"), null)
  var signer = this.hdSigners[index]
  return signer.signRawTx(rawTx,callback);
}

HDWallet.prototype.indexOfSigner = function(address){
  for(var i = 0 ; i < this.hdSigners.length ; i++){
    if(this.hdSigners[i].getAddress() == address){return i;}
  }
  return -1
}

module.exports = HDWallet;
