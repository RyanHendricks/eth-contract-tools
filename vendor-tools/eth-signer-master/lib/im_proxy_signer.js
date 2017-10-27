var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");
var UportIdentity = require('uport-identity')
var txutils = require('./txutils');

// Simple unencrypted signer, not to be used in the browser
var version = UportIdentity.IdentityManager.latestVersion
var abi = UportIdentity.IdentityManager[version].abi;

var IMProxySigner = function(proxy_address, signer, identity_manager_address) {
  this.proxy_address = proxy_address;
  this.identity_manager_address = identity_manager_address || proxy_address;
  this.signer = signer;
}

IMProxySigner.prototype.getAddress = function() {
  return this.proxy_address;
}

IMProxySigner.prototype.signRawTx = function(rawTx, callback) {
  var rawTx = util.stripHexPrefix(rawTx);
  var txCopy = new Transaction(new Buffer(rawTx, 'hex'));
  var wrapperTx = {
              "gasPrice": txCopy.gasPrice,
              "gasLimit": txCopy.gasLimit,
              "value": 0,
              "nonce": txCopy.nonce,
              "to": this.identity_manager_address
              }

  var rawForwardTx = txutils.functionTx(abi, "forwardTo",
    [ util.addHexPrefix(this.proxy_address.toString('hex')),
      util.addHexPrefix(txCopy.to.toString('hex')),
      util.bufferToInt(txCopy.value),
      util.addHexPrefix(txCopy.data.toString('hex')) ], wrapperTx)
  this.signer.signRawTx(rawForwardTx, callback);
}

module.exports = IMProxySigner;
