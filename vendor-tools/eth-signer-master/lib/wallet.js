var util = require("ethereumjs-util");
var Transaction = require('ethereumjs-tx');

var Wallet = function(signers = []) {
  this.signers = signers
}

Wallet.prototype.addAccount = function(signer) {
  this.signers.push(signer)
};

Wallet.prototype.hasAddress = function(address, callback) {
  callback(null, this.indexOfSigner(address) !== -1)
};

Wallet.prototype.getAddress = function(i = 0) {
    if(!this.signers[i]) {return new Error("wallet only has " + this.signers.length + " signers")}
    return this.signers[i].getAddress()
}

Wallet.prototype.getAccounts = function(callback = function(e,r){return r}) {
  callback(null, this.getAddresses());
}

Wallet.prototype.getAddresses = function() {
  var addresses = []
  for (var i = 0 ; i < this.signers.length ; i++) {
    addresses.push(this.signers[i].getAddress())
  }
  return addresses;
}

Wallet.prototype.signTransaction = function (txParams, callback) {
  var i = this.indexOfSigner(util.addHexPrefix(txParams.from));
  if (i === -1) return callback(new Error("address not managed by this wallet"), null)
  // return this.signers[i].signTransaction(txParams, callback);


  var ethjsTxParams = {};
  ethjsTxParams.from = util.addHexPrefix(txParams.from);
  ethjsTxParams.to = util.addHexPrefix(txParams.to);
  ethjsTxParams.gasLimit = util.addHexPrefix(txParams.gas);
  ethjsTxParams.gasPrice = util.addHexPrefix(txParams.gasPrice);
  ethjsTxParams.nonce = util.addHexPrefix(txParams.nonce);
  ethjsTxParams.value = util.addHexPrefix(txParams.value);
  ethjsTxParams.data = util.addHexPrefix(txParams.data);

  var txObj = new Transaction(ethjsTxParams);
  var rawTx = txObj.serialize().toString('hex');
  this.signRawTx(rawTx, ethjsTxParams.from, function(e,signedTx) {
    if (e)
      callback(e,null)
    else
      callback(null, '0x' + signedTx);
  });
};

Wallet.prototype.signRawTx = function(rawTx, senderAddress, callback) {
  var index = this.indexOfSigner(senderAddress);
  if (index === -1) return callback(new Error("address not managed by this wallet"), null)
  var signer = this.signers[index]
  return this.signers[index].signRawTx(rawTx,callback);
}

Wallet.prototype.indexOfSigner = function(address){
  for(var i = 0 ; i < this.signers.length ; i++){
    if(this.signers[i].getAddress() == address){return i;}
  }
  return -1
}

module.exports = Wallet;
