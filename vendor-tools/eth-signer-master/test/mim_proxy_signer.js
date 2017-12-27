var expect = require('chai').expect
var TxRelaySigner = require('../lib/tx_relay_signer');
var MIMProxySigner = require('../lib/mim_proxy_signer');
var keypair = require('./fixtures/keypair')
var util = require("ethereumjs-util");

describe("MetaIdentityManagerSigner", function () {
  var proxyAddress = "0xdaeee689e6fb3e0971ecffba4082a24cfb23ed48";
  var metaIdentityManagerAddress = "0xeffd2f248e6ea7a756bb76415d88ce5d5cd44351";
  var relayAddress = "0xf85c44a9062acddcb5b174868fc62dd1f8c9e7f9";
  var txSenderAddress = "0xea674fdde714fd979de3edf0f56aa9716b898ec8";
  var rawTx = "f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080";
  var relaySigner = new TxRelaySigner(keypair, relayAddress, txSenderAddress);
  var signer = new MIMProxySigner(proxyAddress, relaySigner, metaIdentityManagerAddress);

  describe("getAddress", function() {
    it("returns its address", function(done) {
      expect(signer.getAddress()).to.equal(proxyAddress);
      done();
    })
  })

  describe("signRawTx", function() {
    it("signs transaction", function(done) {
      signer.signRawTx(rawTx, function(e, metaSignedRawTx) {
        expect(e).to.be.null;
        expect(metaSignedRawTx).to.equal("f9020b80850ba43b7400832fefd894f85c44a9062acddcb5b174868fc62dd1f8c9e7f980b901e4c3f44c0a000000000000000000000000000000000000000000000000000000000000001bea9af24b260a9f8a812df00151ecfd2e5a086f38b5d9b20bd230738821a47c5b0ef679ff44502ba3f004008a4be46266a1395bbed7d3ee639c39a3ad510fc18b000000000000000000000000effd2f248e6ea7a756bb76415d88ce5d5cd4435100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4701b88260000000000000000000000007f2d6bb19b6a52698725f4a292e985c51cefc315000000000000000000000000daeee689e6fb3e0971ecffba4082a24cfb23ed480000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000090abcdef012345678900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c8080");
        done();
      });
    })
  })
});
