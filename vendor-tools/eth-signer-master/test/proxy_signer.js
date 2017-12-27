var expect = require('chai').expect
var SimpleSigner = require('../lib/simple_signer');
var ProxySigner = require('../lib/proxy_signer');
var keypair = require('./fixtures/keypair')
var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");

describe("ProxySigner", function () {
  var proxy_address = "0xdaeee689e6fb3e0971ecffba4082a24cfb23ed48"
  var signer = new ProxySigner(proxy_address,new SimpleSigner(keypair));

  describe("getAddress", function() {
    it("returns its address", function(done) {
      expect(signer.getAddress()).to.equal(proxy_address);
      done();
    })
  })

  describe("signRawTx", function() {
    it("signs transaction", function(done) {
      signer.signRawTx("f680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080",
        function(e, signedRawTx) {
          expect(signedRawTx).to.equal("f9010a80850ba43b7400832fefd894daeee689e6fb3e0971ecffba4082a24cfb23ed4880b8a4d7f31eb90000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001ca07b28773694e1727b58971efcfce612259ac818cdde24d9948b7abc4a54216f0ba02f48c5fcc43550526ed4377598b3b2ff7e7e01578503bce2c08c1db66e2e790c");
          var tx = new Transaction(signedRawTx);
          expect(tx.getSenderPublicKey().toString('hex')).to.equal(util.stripHexPrefix(keypair.publicKey));
          done();
      });
    })
  })
});
