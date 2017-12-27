var Transaction = require('ethereumjs-tx');
var UportIdentity = require('uport-identity')
var util = require("ethereumjs-util");
var txutils = require('./txutils');

var version = UportIdentity.MetaIdentityManager.latestVersion
var MetaIdentityManagerAbi = UportIdentity.MetaIdentityManager[version].abi;

var MIMProxySigner = function(proxyAddress, signer, metaIdentityManagerAddress) {
  this.proxyAddress = proxyAddress;
  this.metaIdentityManagerAddress = metaIdentityManagerAddress;
  this.signer = signer;
}

MIMProxySigner.prototype.getAddress = function() {
  return this.proxyAddress;
}

MIMProxySigner.prototype.signRawTx = function(rawTx, callback) {
  var rawTx = util.stripHexPrefix(rawTx);
  var txCopy = new Transaction(new Buffer(rawTx, 'hex'));
  var finalDestination = txCopy.to;
  var wrapperTx = {
              "gasPrice": txCopy.gasPrice,
              "gasLimit": txCopy.gasLimit,
              "value": 0,
              "nonce": txCopy.nonce,
              "to": this.metaIdentityManagerAddress
              }
  var rawForwardTx = txutils.functionTx(MetaIdentityManagerAbi, 'forwardTo',
    [ util.addHexPrefix(this.signer.getAddress()),
      util.addHexPrefix(this.proxyAddress),
      util.addHexPrefix(finalDestination.toString('hex')),
      util.bufferToInt(txCopy.value),
      util.addHexPrefix(txCopy.data.toString('hex')) ], wrapperTx)
  this.signer.signRawTx(rawForwardTx, callback);
}


module.exports = MIMProxySigner;
