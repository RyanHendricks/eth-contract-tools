var Random = require('./generators/random');
var Transaction = require('ethereumjs-tx');
var UportIdentity = require('uport-identity')
var util = require("ethereumjs-util");
var txutils = require('./txutils');

var version = UportIdentity.Proxy.latestVersion
var abi = UportIdentity.Proxy[version].abi;

// Simple unencrypted signer, not to be used in the browser
var ProxySigner = function(proxy_address, signer, controller_address) {
  this.proxy_address = proxy_address;
  this.controller_address = controller_address || proxy_address;
  this.signer = signer;
}

ProxySigner.prototype.getAddress = function() {
  return this.proxy_address;
}

ProxySigner.prototype.signRawTx = function(rawTx, callback) {
  var rawTx = util.stripHexPrefix(rawTx);
  var txCopy = new Transaction(new Buffer(rawTx, 'hex'));
  var value = txCopy.value;
  var finalDestination = txCopy.to;
  var wrapperTx = {
              "gasPrice": txCopy.gasPrice,
              "gasLimit": txCopy.gasLimit,
              "value": 0,
              "nonce": txCopy.nonce,
              "to": this.controller_address
              }
  var rawForwardTx = txutils.functionTx(abi,"forward",
    [ util.addHexPrefix(txCopy.to.toString('hex')),
      util.bufferToInt(txCopy.value),
      util.addHexPrefix(txCopy.data.toString('hex')) ], wrapperTx)
  this.signer.signRawTx(rawForwardTx,callback);
}


module.exports = ProxySigner;
