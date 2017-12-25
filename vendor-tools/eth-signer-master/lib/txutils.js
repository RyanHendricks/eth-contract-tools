var Transaction = require('ethereumjs-tx');
var coder = require('web3/lib/solidity/coder');
var rlp = require('rlp');
var CryptoJS = require('crypto-js');
var util = require("ethereumjs-util");

function add0x(input) {
  if (typeof(input) !== 'string') {
    return input;
  }
  else if (input.length < 2 || input.slice(0,2) !== '0x') {
    return '0x' + input;
  }
  else {
    return input;
  }
}

function _encodeFunctionTxData(functionName, types, args) {

  var fullName = functionName + '(' + types.join() + ')';
  var signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
  var dataHex = signature + coder.encodeParams(types, args);

  return dataHex;
}

function _decodeFunctionTxData(data, types) {
  var bytes = data.slice(8);

  return coder.decodeParams(types, bytes);
}

function _getTypesFromAbi(abi, functionName) {

  function matchesFunctionName(json) {
    return (json.name === functionName && json.type === 'function');
  }

  function getTypes(json) {
    return json.type;
  }

  var funcJson = abi.filter(matchesFunctionName)[0];

  return (funcJson.inputs).map(getTypes);
}

function functionTx(abi, functionName, args, txObject) {
  // txObject contains gasPrice, gasLimit, nonce, to, value

  var types = _getTypesFromAbi(abi, functionName);
  var txData = _encodeFunctionTxData(functionName, types, args);

  var txObjectCopy = {};
  txObjectCopy.to = add0x(txObject.to);
  txObjectCopy.gasPrice = add0x(txObject.gasPrice);
  txObjectCopy.gasLimit = add0x(txObject.gasLimit);
  txObjectCopy.nonce = add0x(txObject.nonce);
  txObjectCopy.data = add0x(txData);
  txObjectCopy.value = add0x(txObject.value);

  return (new Transaction(txObjectCopy)).serialize().toString('hex');
}

function createdContractAddress (fromAddress, nonce) {
  var rlpEncodedHex = rlp.encode([new Buffer(fromAddress, 'hex'), nonce]).toString('hex');
  var rlpEncodedWordArray = CryptoJS.enc.Hex.parse(rlpEncodedHex);
  var hash = CryptoJS.SHA3(rlpEncodedWordArray, {outputLength: 256}).toString(CryptoJS.enc.Hex);

  return hash.slice(24);
}

function createContractTx (fromAddress, txObject) {
  // txObject contains gasPrice, gasLimit, value, data, nonce

  var txObjectCopy = {};
  txObjectCopy.to = add0x(txObject.to);
  txObjectCopy.gasPrice = add0x(txObject.gasPrice);
  txObjectCopy.gasLimit = add0x(txObject.gasLimit);
  txObjectCopy.nonce = add0x(txObject.nonce);
  txObjectCopy.data = add0x(txObject.data);
  txObjectCopy.value = add0x(txObject.value);

  var contractAddress = createdContractAddress(fromAddress, txObject.nonce);
  var tx = new Transaction(txObjectCopy);

  return {tx: tx.serialize().toString('hex'), addr: contractAddress};
}

function valueTx (txObject) {
  // txObject contains gasPrice, gasLimit, value, nonce

  var txObjectCopy = {};
  txObjectCopy.to = add0x(txObject.to);
  txObjectCopy.gasPrice = add0x(txObject.gasPrice);
  txObjectCopy.gasLimit = add0x(txObject.gasLimit);
  txObjectCopy.nonce = add0x(txObject.nonce);
  txObjectCopy.value = add0x(txObject.value);

  var tx = new Transaction(txObjectCopy);

  return tx.serialize().toString('hex');
}

module.exports = {
  _encodeFunctionTxData: _encodeFunctionTxData,
  _decodeFunctionTxData: _decodeFunctionTxData,
  _getTypesFromAbi: _getTypesFromAbi,
  functionTx: functionTx,
  createdContractAddress: createdContractAddress,
  createContractTx: createContractTx,
  valueTx: valueTx,
  add0x: add0x
};
