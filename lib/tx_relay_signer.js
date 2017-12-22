var Transaction = require('ethereumjs-tx');
var UportIdentity = require('uport-identity')
var util = require("ethereumjs-util");
var solsha3 = require('solidity-sha3').default
var leftPad = require('left-pad')
var txutils = require('./txutils');

var version = UportIdentity.TxRelay.latestVersion
var txRelayAbi = UportIdentity.TxRelay[version].abi;

var TxRelaySigner = function(keypair, txRelayAddress, txSenderAddress, whitelistOwner) {
  this.keypair = keypair;
  this.txRelayAddress = txRelayAddress;
  this.txSenderAddress = txSenderAddress;
  this.whitelistOwner = whitelistOwner;
}

TxRelaySigner.prototype.getAddress = function() {
  return this.keypair.address;
}

TxRelaySigner.prototype.signRawTx = function(rawTx, callback) {
  var rawTx = util.stripHexPrefix(rawTx);
  var txCopy = new Transaction(Buffer.from(rawTx, 'hex'));

  var nonce = txCopy.nonce.toString('hex');
  var to = txCopy.to.toString('hex');
  var data = txCopy.data.toString('hex');
  if (!nonce) {
    // if the buffer is empty nonce should be zero
    nonce = '0';
  }
  // Tight packing, as Solidity sha3 does
  var hashInput = '0x1900' + util.stripHexPrefix(this.txRelayAddress)
                  + util.stripHexPrefix(this.whitelistOwner) + pad(nonce) + to + data;
  var hash = solsha3(hashInput);
  var sig = this.signMsgHash(hash);

  var wrapperTx = {
    "gasPrice": txCopy.gasPrice,
    "gasLimit": txCopy.gasLimit,
    "value": 0,
    "to": this.txRelayAddress,
    "from": this.txSenderAddress,
  };
  var rawMetaSignedTx = txutils.functionTx(txRelayAbi, "relayMetaTx",
    [ sig.v,
      util.addHexPrefix(sig.r.toString('hex')),
      util.addHexPrefix(sig.s.toString('hex')),
      util.addHexPrefix(to),
      util.addHexPrefix(data),
      util.addHexPrefix(this.whitelistOwner)
    ], wrapperTx)

  callback(null, rawMetaSignedTx);
}

TxRelaySigner.prototype.signMsgHash = function(msgHash) {
  return util.ecsign(Buffer.from(util.stripHexPrefix(msgHash), 'hex'), Buffer.from(util.stripHexPrefix(this.keypair.privateKey), 'hex'));
}

TxRelaySigner.decodeMetaTx = function(rawMetaSignedTx) {
  var tx = new Transaction(Buffer.from(rawMetaSignedTx, 'hex'));
  var txData = tx.data.toString('hex');
  var types = txutils._getTypesFromAbi(txRelayAbi, "relayMetaTx");
  var params = txutils._decodeFunctionTxData(txData, types);

  decodedMetaTx = {}
  decodedMetaTx.v = params[0].toNumber();
  decodedMetaTx.r = Buffer.from(util.stripHexPrefix(params[1]), 'hex');
  decodedMetaTx.s = Buffer.from(util.stripHexPrefix(params[2]), 'hex');
  decodedMetaTx.to = util.stripHexPrefix(params[3]);
  decodedMetaTx.data = util.stripHexPrefix(params[4]);
  decodedMetaTx.whitelistOwner = util.stripHexPrefix(params[5]);
  // signed tx data must start with the address of the meta sender
  decodedMetaTx.claimedAddress = '0x' + decodedMetaTx.data.slice(32, 72);

  return decodedMetaTx;
}

TxRelaySigner.isMetaSignatureValid = function(txRelayAddress, decodedMetaTx, nonce) {
  if (typeof nonce !== 'string') throw new Error('nonce must be a string')
  var hashInput = '0x1900' + util.stripHexPrefix(txRelayAddress) + util.stripHexPrefix(decodedMetaTx.whitelistOwner)
                  + pad(nonce) + decodedMetaTx.to + decodedMetaTx.data
  var msgHash = solsha3(hashInput);
  var pubkey = util.ecrecover(Buffer.from(util.stripHexPrefix(msgHash), 'hex'), decodedMetaTx.v, decodedMetaTx.r, decodedMetaTx.s);
  var address = '0x' + util.pubToAddress(pubkey).toString('hex');
  return address === decodedMetaTx.claimedAddress;
}

function pad(n) {
  if (n.startsWith('0x')) {
    n = util.stripHexPrefix(n);
  }
  return leftPad(n, '64', '0');
}

module.exports = TxRelaySigner
