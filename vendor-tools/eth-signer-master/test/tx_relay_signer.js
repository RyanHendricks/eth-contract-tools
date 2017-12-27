var expect = require('chai').expect
var TxRelaySigner = require('../lib/tx_relay_signer');
var keypair = require('./fixtures/keypair')
var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");

describe("TxRelaySigner", function () {
  var relayAddress = "0xf85c44a9062acddcb5b174868fc62dd1f8c9e7f9";
  var txSenderAddress = "0xea674fdde714fd979de3edf0f56aa9716b898ec8";
  var whitelistOwner = "0x737f53c0cebf0acd1ea591685351b2a8580702a5";
  var rawTx = "f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080";
  var signer = new TxRelaySigner(keypair, relayAddress, txSenderAddress, whitelistOwner);

  describe("getAddress", function() {
    it("returns its address", function(done) {
      expect(signer.getAddress()).to.equal(keypair.address);
      done();
    })
  })

  describe("signMsgHash", function() {
    it("should sign a hash correctly", function(done) {
      var msgHash = "0x6b0e83bf7658d26aa7b50b457dacb63a33844df405f2340ae6ef0a523dc5c34a";
      var sig = signer.signMsgHash(msgHash);
      var pubkey = util.ecrecover(Buffer.from(msgHash.slice(2), 'hex'), sig.v, sig.r, sig.s);
      var address = '0x' + util.pubToAddress(pubkey).toString('hex');
      expect(address).to.equal(keypair.address);
      done()
    })
  })

  describe("metaSignRawTx", function() {
    it("should meta sign transaction", function(done) {
      signer.signRawTx(rawTx, function(e, metaSignedRawTx) {
        // This isn't really good enough as a test, ideas are welcome
        // I think the best way to test it is to do an integration test against the txRelay
        expect(metaSignedRawTx).to.equal("f9012b80850ba43b7400832fefd894f85c44a9062acddcb5b174868fc62dd1f8c9e7f980b90104c3f44c0a000000000000000000000000000000000000000000000000000000000000001ca5ea2ebc7fdeda7dd51e730aeb375f5d1dbd9f37f64a9b58a1a8fba78b64c29c79783652dd3afa35fd1a2da566ebb7dd5fb693b58e04625bbdd1225f17d8e5e90000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000737f53c0cebf0acd1ea591685351b2a8580702a500000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001c8080");
        done();
      });
    })
  })
});
