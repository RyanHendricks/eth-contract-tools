var Contract = require('truffle-contract')
var TestRPC = require('ethereumjs-testrpc');
var Web3 = require('web3')
var UportIdentity = require('uport-identity')
var Transaction = require('ethereumjs-tx');
var expect = require('chai').expect
const Promise = require('bluebird')
var ProxySigner = require('../../lib/proxy_signer')
var SimpleSigner = require('../../lib/simple_signer')
var TxRelaySigner = require('../../lib/tx_relay_signer')
var MIMProxySigner = require('../../lib/mim_proxy_signer')
var KeyPair = require('../../lib/generators/key_pair')
var txutils = require('../../lib/txutils')
var testRegArtifact = require('../fixtures/TestRegistry')

var provider = TestRPC.provider()
var web3 = new Web3(provider)
var TestRegistry = Contract(testRegArtifact)
var Proxy = Contract(UportIdentity.Proxy[UportIdentity.Proxy.latestVersion])
var IdentityManager = Contract(UportIdentity.MetaIdentityManager[UportIdentity.MetaIdentityManager.latestVersion])
var TxRelay = Contract(UportIdentity.TxRelay[UportIdentity.TxRelay.latestVersion])
TestRegistry.setProvider(provider)
Proxy.setProvider(provider)
IdentityManager.setProvider(provider)
TxRelay.setProvider(provider)

web3.eth = Promise.promisifyAll(web3.eth)
KeyPair = Promise.promisifyAll(KeyPair)

var zeroAddress = "0x0000000000000000000000000000000000000000"

function getRandomNumber() {
  return Math.floor(Math.random() * (1000000 - 1)) + 1;
}


describe("MetaIdentityManager, signers with contracts", function() {
  var accounts = Object.keys(provider.manager.state.accounts)
  // user1 will be our sender of meta txs
  var user1 = accounts[0]
  var user2 = accounts[1]
  var txParams = {from: user1, gas: 2000000}
  var keypair1
  var keypair2
  var testReg
  var txRelay
  var proxy
  var identityManager

  before(async function() {
    keypair1 = await KeyPair.generateAsync()
    keypair2 = await KeyPair.generateAsync()

    testReg = await TestRegistry.new(txParams)
    txRelay = await TxRelay.new(txParams)
    identityManager = await IdentityManager.new(0, 0, 0, txRelay.address, txParams)
    var tx = await identityManager.createIdentity(keypair1.address, user1, txParams)
    proxy = Proxy.at(tx.logs[0].args.identity)

    await web3.eth.sendTransactionAsync({from: user1, to: keypair1.address, value: web3.toWei(10, 'ether')})
    await web3.eth.sendTransactionAsync({from: user1, to: keypair2.address, value: web3.toWei(10, 'ether')})
    await web3.eth.sendTransactionAsync({from: user1, to: proxy.address, value: web3.toWei(10, 'ether')})
  })

  describe("With regular transaction", function() {
    var simpleSigner
    var identityManagerSigner

    before(function() {
      simpleSigner = new SimpleSigner(keypair1)
      simpleSigner = Promise.promisifyAll(simpleSigner)
      identityManagerSigner = new MIMProxySigner(proxy.address, simpleSigner, identityManager.address)
      identityManagerSigner = Promise.promisifyAll(identityManagerSigner)

    })

    it("Should send tx correctly", async function() {
      var testNum = getRandomNumber()
      var nonce = await web3.eth.getTransactionCountAsync(keypair1.address)
      var wrapperTx = new Transaction({
        to: testReg.address,
        value: 0,
        nonce: nonce,
        gasLimit: 2000000
      })
      var rawTx = txutils.functionTx(testRegArtifact.abi, 'register', [testNum], wrapperTx)
      var signedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)
      await web3.eth.sendRawTransactionAsync(signedRawTx)

      var registeredNum = await testReg.registry.call(proxy.address)
      expect(registeredNum.toNumber()).to.equal(testNum)
    })

    it("Should send value correctly", async function() {
      var valueToSend = 1000
      var user2InitBal = await web3.eth.getBalanceAsync(user2)
      var proxyInitBal = await web3.eth.getBalanceAsync(proxy.address)

      var nonce = await web3.eth.getTransactionCountAsync(keypair1.address)
      var rawTx = new Transaction({
        to: user2,
        value: valueToSend,
        nonce: nonce,
        data: 0,
        gasLimit: 2000000
      }).serialize().toString('hex')
      var signedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)
      await web3.eth.sendRawTransactionAsync(signedRawTx)

      var user2NewBal = await web3.eth.getBalanceAsync(user2)
      var proxyNewBal = await web3.eth.getBalanceAsync(proxy.address)
      expect(user2NewBal.minus(user2InitBal).toNumber()).to.equal(valueToSend)
      expect(proxyInitBal.minus(proxyNewBal).toNumber()).to.equal(valueToSend)
    })
  })

  describe("With meta transaction", function() {
    var simpleSigner
    var relaySigner
    var identityManagerSigner

    before(function() {
      // the simple singer is the service that will be sending the txs
      simpleSigner = new SimpleSigner(keypair2)
      simpleSigner = Promise.promisifyAll(simpleSigner)
      // relaySigner and identityManagerSigner are used to meta sign the txs
      relaySigner = new TxRelaySigner(keypair1, txRelay.address, keypair2.address, zeroAddress)
      relaySigner = Promise.promisifyAll(relaySigner)
      identityManagerSigner = new MIMProxySigner(proxy.address, relaySigner, identityManager.address)
      identityManagerSigner = Promise.promisifyAll(identityManagerSigner)
    })

    it("Should send tx correctly", async function() {
      var testNum = getRandomNumber()
      var nonce = await txRelay.getNonce(keypair1.address)
      var wrapperTx = new Transaction({
        to: testReg.address,
        value: 0,
        nonce: nonce.toNumber(),
        gasLimit: 2000000
      })
      var rawTx = txutils.functionTx(testRegArtifact.abi, 'register', [testNum], wrapperTx)
      // tx is meta signed on users device
      var metaSignedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)

      var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
      var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce.toString(), zeroAddress)
      expect(validMetaSig).to.be.true;

      // tx is signed and sent to the network by a separate service
      var signedRawTx = await simpleSigner.signRawTxAsync(metaSignedRawTx)
      await web3.eth.sendRawTransactionAsync(signedRawTx)

      var registeredNum = await testReg.registry.call(proxy.address)
      expect(registeredNum.toNumber()).to.equal(testNum)
    })

    it("Should send value correctly", async function() {
      var valueToSend = 1000
      var user2InitBal = await web3.eth.getBalanceAsync(user2)
      var proxyInitBal = await web3.eth.getBalanceAsync(proxy.address)

      var nonce = await txRelay.getNonce(keypair1.address)
      var rawTx = new Transaction({
        to: user2,
        value: valueToSend,
        nonce: nonce.toNumber(),
        data: 0,
        gasLimit: 2000000
      }).serialize().toString('hex')
      var metaSignedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)

      var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
      var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce.toString(), zeroAddress)
      expect(validMetaSig).to.be.true;

      var txCopy = new Transaction(Buffer.from(metaSignedRawTx, 'hex'))
      txCopy.nonce = await web3.eth.getTransactionCountAsync(keypair2.address)
      var metaSignedRawTxWithNonce = txCopy.serialize().toString('hex')
      var signedRawTx = await simpleSigner.signRawTxAsync(metaSignedRawTxWithNonce)
      await web3.eth.sendRawTransactionAsync(signedRawTx)

      var user2NewBal = await web3.eth.getBalanceAsync(user2)
      var proxyNewBal = await web3.eth.getBalanceAsync(proxy.address)
      expect(user2NewBal.minus(user2InitBal).toNumber()).to.equal(valueToSend)
      expect(proxyInitBal.minus(proxyNewBal).toNumber()).to.equal(valueToSend)
    })

    it("Should be able to send meta txs to IdentityManager", async function() {
      var nonce = await txRelay.getNonce(keypair1.address)
      var wrapperTx = new Transaction({
        to: identityManager.address,
        value: 0,
        nonce: nonce.toNumber(),
        data: 0,
        gasLimit: 2000000
      })

      var rawForwardTx = txutils.functionTx(IdentityManager.abi, 'addOwner',
        [keypair1.address, proxy.address, keypair2.address], wrapperTx)

      var metaSignedRawTx = await relaySigner.signRawTxAsync(rawForwardTx)
      var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
      var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce.toString(), zeroAddress)
      expect(validMetaSig).to.be.true;

      var txCopy = new Transaction(Buffer.from(metaSignedRawTx, 'hex'))
      txCopy.nonce = await web3.eth.getTransactionCountAsync(keypair2.address)
      var metaSignedRawTxWithNonce = txCopy.serialize().toString('hex')
      var signedRawTx = await simpleSigner.signRawTxAsync(metaSignedRawTxWithNonce)
      var txHash = await web3.eth.sendRawTransactionAsync(signedRawTx)
      var tx = await web3.eth.getTransactionReceiptAsync(txHash)

      expect('0x' + tx.logs[0].topics[2].slice(26)).to.equal(keypair2.address)
    })

    describe("With whitelist", function () {
      var whitelistOwner

      before(function() {
        whitelistOwner = user1
        // relaySigner and identityManagerSigner are used to meta sign the txs
        relaySigner = new TxRelaySigner(keypair1, txRelay.address, keypair2.address, whitelistOwner)
        relaySigner = Promise.promisifyAll(relaySigner)
        identityManagerSigner = new MIMProxySigner(proxy.address, relaySigner, identityManager.address)
        identityManagerSigner = Promise.promisifyAll(identityManagerSigner)
      })

      it("Should throw tx if sender not on whitelist", async function() {
        var testNum = getRandomNumber()
        var nonce = await txRelay.getNonce(keypair1.address)
        var wrapperTx = new Transaction({
          to: testReg.address,
          value: 0,
          nonce: nonce.toNumber(),
          gasLimit: 2000000
        })
        var rawTx = txutils.functionTx(testRegArtifact.abi, 'register', [testNum], wrapperTx)
        // tx is meta signed on users device
        var metaSignedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)

        var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
        var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce.toString())
        expect(validMetaSig).to.be.true;

        // tx is signed and sent to the network by a separate service
        var txCopy = new Transaction(Buffer.from(metaSignedRawTx, 'hex'))
        txCopy.nonce = await web3.eth.getTransactionCountAsync(keypair2.address)
        var metaSignedRawTxWithNonce = txCopy.serialize().toString('hex')
        var signedRawTx = await simpleSigner.signRawTxAsync(metaSignedRawTxWithNonce)

        var error = {}
        try {
          await web3.eth.sendRawTransactionAsync(signedRawTx)
        } catch (e) {
          error = e
        }
        expect(error.message).to.equal("VM Exception while processing transaction: invalid opcode")
      })

      it("Should send tx correctly with whitelist", async function() {
        await txRelay.addToWhitelist([keypair2.address], {from: user1})
        var isOnWhitelist = await txRelay.whitelist.call(user1, keypair2.address)
        expect(isOnWhitelist).to.be.true;
        var testNum = getRandomNumber()
        var nonce = await txRelay.getNonce(keypair1.address)
        var wrapperTx = new Transaction({
          to: testReg.address,
          value: 0,
          nonce: nonce.toNumber(),
          gasLimit: 2000000
        })
        var rawTx = txutils.functionTx(testRegArtifact.abi, 'register', [testNum], wrapperTx)
        // tx is meta signed on users device
        var metaSignedRawTx = await identityManagerSigner.signRawTxAsync(rawTx)

        var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
        var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce.toString())
        expect(validMetaSig).to.be.true;

        // tx is signed and sent to the network by a separate service
        var txCopy = new Transaction(Buffer.from(metaSignedRawTx, 'hex'))
        txCopy.nonce = await web3.eth.getTransactionCountAsync(keypair2.address)
        var metaSignedRawTxWithNonce = txCopy.serialize().toString('hex')
        var signedRawTx = await simpleSigner.signRawTxAsync(metaSignedRawTxWithNonce)
        await web3.eth.sendRawTransactionAsync(signedRawTx)

        var registeredNum = await testReg.registry.call(proxy.address)
        expect(registeredNum.toNumber()).to.equal(testNum)
      })
    })
  })
})
