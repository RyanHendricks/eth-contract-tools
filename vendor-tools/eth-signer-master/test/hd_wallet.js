var expect = require('chai').expect
var Phrase = require('../lib/generators/phrase');
var fixtures = require('./fixtures/keystore')
var HDWallet = require('../lib/hd_wallet');
var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");

describe("HDWallet", function () {
  var phrase = 'dress bounce bind upset boat slot hub upgrade marriage beauty human short';
  var wallet = new HDWallet(phrase, 5);
  var address = "0x7008907ffc8811a5c690b554a81296d38ee35bdd";

  describe("getAddress", function() {
    it("returns its address", function(done) {
      expect(wallet.getAddress()).to.equal(address);
      done();
    })
  })

  describe("signTransaction", function() {
    it("returns a signed tx", function(done) {
      var txParams = {"from" : address,
                        "to" : "0x9e2068cce22de4e1e80f15cb71ef435a20a3b37c",
                        "nonce" : "0x00",
                        "value" : "0xde0b6b3a7640000",
                        "gas" : "0x2fefd8",
                        "gasPrice" : "0xba43b7400",
                        "data" : "0xabcdef01234567890"};

      wallet.signTransaction(txParams, function(e, signedRawTx) {
        expect(signedRawTx).to.equal("0xf87680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901ba0c3c7c82b17fd1f355d27722049e501fc5f8108c0a94298b6df298f0961537b5da03479ccf724ee60196bc19e37e4d4d23257d1b1d90bebbd267bd647d135e0764c");
        var tx = new Transaction(signedRawTx);
        // expect(tx.getSenderPublicKey().toString('hex')).to.equal(address);
        done();
      });
    })
  })

  describe("signRawTx", function() {
    it("signs transaction", function(done) {
      wallet.signRawTx("f680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080",
        "0x7008907ffc8811a5c690b554a81296d38ee35bdd",
        function(e, signedRawTx) {
          expect(signedRawTx).to.equal("f87680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901ba0c3c7c82b17fd1f355d27722049e501fc5f8108c0a94298b6df298f0961537b5da03479ccf724ee60196bc19e37e4d4d23257d1b1d90bebbd267bd647d135e0764c");
          var tx = new Transaction(signedRawTx);
          expect(tx.getSenderPublicKey().toString('hex')).to.equal(util.stripHexPrefix(wallet.hdSigners[0].signer.keypair.publicKey));
          done();
      });
    })
  })

  describe("changed path", function() {
    var wallet = new HDWallet(phrase, 3);
    var address0 = "0x7008907ffc8811a5c690b554a81296d38ee35bdd";
    var address1 = "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319";
    var address2 = "0xc0ace8c52c0a2145eb04965904e75e0776ffc4c1";

    describe("getAddress", function() {
      it("returns its 2nd address", function(done) {
        expect(wallet.getAddress()).to.equal(address0);
        expect(wallet.getAddress(0)).to.equal(address0);
        expect(wallet.getAddress(1)).to.equal(address1);
        expect(wallet.getAddress(2)).to.equal(address2);
        done();
      })
    })
  });

  describe("secondary addresses", function() {
    var wallet = new HDWallet(phrase, 1);
    wallet.addAccounts(2);
    var address1 = "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319";
    var address2 = "0xc0ace8c52c0a2145eb04965904e75e0776ffc4c1";

    describe("getAddress", function() {
      it("returns its address", function(done) {
        expect(wallet.getAddress(2)).to.equal(address2);
        done();
      })
    })

    describe("hasAddress", function() {
      it("returns true", function(done) {
        wallet.hasAddress(address1, function(e, r){
          expect(r).to.equal(true);
          done();
        })
      })
      it("returns true", function(done) {
        wallet.hasAddress(address2, function(e, r){
          expect(r).to.equal(true);
          done();
        })
      })
      it("returns false", function(done) {
        wallet.hasAddress("0x1234567890123456789012345678901234567890", function(e, r){
          expect(r).to.equal(false);
          done();
        })
      })
    })
  });

  describe("getAccounts", function() {
    var wallet = new HDWallet(phrase, 2);
    var address0 = "0x7008907ffc8811a5c690b554a81296d38ee35bdd";
    var address1 = "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319";
    it("calls a callback with an array of addresses", function(done) {
      wallet.getAccounts(function(e, r){
        expect(r).to.deep.equal(["0x7008907ffc8811a5c690b554a81296d38ee35bdd",
                                 "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319"]);
        done();
      })
    })
  })

  describe("returns an array of addresses", function() {
    var wallet = new HDWallet(phrase, 2);
    var address0 = "0x7008907ffc8811a5c690b554a81296d38ee35bdd";
    var address1 = "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319";
    it("returns true", function(done) {
      expect(wallet.getAddresses()).to.deep.equal(["0x7008907ffc8811a5c690b554a81296d38ee35bdd",
                                                   "0x653f4156b7e1979af34c0cb1d746a42ed4dc4319"]);
      done();
    })
  })

});
