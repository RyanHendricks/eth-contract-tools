var expect = require('chai').expect
var Phrase = require('../lib/generators/phrase');
var fixtures = require('./fixtures/keystore')
var Wallet = require('../lib/wallet');
var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");
var HDSigner = require('../lib/hd_signer');
var ProxySigner = require('../lib/proxy_signer');
var Signer = require('../lib/signer');

describe("Wallet", function () {
  var phrase = Phrase.toHDPrivateKey('dress bounce bind upset boat slot hub upgrade marriage beauty human short');
  var hdSignerAccount0 =    new HDSigner(phrase, 0)
  var hdSignerAccount1 =    new HDSigner(phrase, 1)
  var simpleSignerAccount2 = new HDSigner(phrase, 2).signer
  var proxyAccount3 = new ProxySigner("0x1111111111111111111111111111111111111111", new HDSigner(phrase, 3).signer, "0x2222222222222222222222222222222222222222")

  describe("addAccount", function() {
    var wallet = new Wallet([
      hdSignerAccount0,
      hdSignerAccount1,
      simpleSignerAccount2,
      proxyAccount3
    ]);

    expect(wallet.signers.length).to.equal(4)
    it("has another signer in the wallet", function(done) {
      wallet.addAccount(new HDSigner(phrase, 4))
      expect(wallet.signers.length).to.equal(5);
      done();
    })
  })

  describe("read only functions", function() {
    var wallet = new Wallet([
      hdSignerAccount0,
      hdSignerAccount1,
      simpleSignerAccount2,
      proxyAccount3
    ]);

    it("hasAddress", function(done) {
      wallet.hasAddress('0x653f4156b7e1979af34c0cb1d746a42ed4dc4319', function(e,r){
        expect(r).to.equal(true)
      })
      wallet.hasAddress('0x653f4156b7e1979af34c0cb1d746a42ed4dc4310', function(e,r){
        expect(r).to.equal(false)
      })
      done();
    })

    it("getAddress", function(done) {
      expect(wallet.getAddress()).to.equal('0x7008907ffc8811a5c690b554a81296d38ee35bdd')
      expect(wallet.getAddress(0)).to.equal('0x7008907ffc8811a5c690b554a81296d38ee35bdd')
      expect(wallet.getAddress(1)).to.equal('0x653f4156b7e1979af34c0cb1d746a42ed4dc4319')
      expect(wallet.getAddress(2)).to.equal('0xc0ace8c52c0a2145eb04965904e75e0776ffc4c1')
      done();
    })

    it("getAccounts", function(done) {
      wallet.getAccounts(function(e,r){
        expect(r).to.deep.equal([ 
          '0x7008907ffc8811a5c690b554a81296d38ee35bdd',
          '0x653f4156b7e1979af34c0cb1d746a42ed4dc4319',
          '0xc0ace8c52c0a2145eb04965904e75e0776ffc4c1',
          '0x1111111111111111111111111111111111111111'
        ])
      })
      done();
    })

    it("getAddresses", function(done) {
      expect(wallet.getAddresses()).to.deep.equal([ 
        '0x7008907ffc8811a5c690b554a81296d38ee35bdd',
        '0x653f4156b7e1979af34c0cb1d746a42ed4dc4319',
        '0xc0ace8c52c0a2145eb04965904e75e0776ffc4c1',
        '0x1111111111111111111111111111111111111111'
      ])
      done();
    })
  })

  describe("signTransaction", function() {
    var wallet = new Wallet([
      hdSignerAccount0,
      hdSignerAccount1,
      simpleSignerAccount2,
      proxyAccount3
    ]);

    it("returns a signed tx", function(done) {
      var txParams = {"from" : "0x1111111111111111111111111111111111111111",
                        "to" : "0x9e2068cce22de4e1e80f15cb71ef435a20a3b37c",
                        "nonce" : "0x00",
                        "value" : "0xde0b6b3a7640000",
                        "gas" : "0x2fefd8",
                        "gasPrice" : "0xba43b7400",
                        "data" : "0xabcdef01234567890"};

      wallet.signTransaction(txParams, function(e, signedRawTx) {
        expect(signedRawTx).to.equal("0xf9010a80850ba43b7400832fefd894222222222222222222222222222222222222222280b8a4d7f31eb90000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001ca0e436a00866c7cfe01d9c37bfd3817aff5cb02479f7b742062fcc22d64d251e30a02b9790bdd60f76c849b66b1a4a844b6bb71dd4e1b0d2ddcabf9ac7b8968ef949");
        var tx = new Transaction(signedRawTx);
        done();
      });
    })
  })  
});
