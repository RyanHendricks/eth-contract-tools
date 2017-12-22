var expect = require('chai').expect
var SimpleSigner = require('../lib/simple_signer');
var IMProxySigner = require('../lib/im_proxy_signer');
var keypair = require('./fixtures/keypair')
var Transaction = require('ethereumjs-tx');
var util = require("ethereumjs-util");

describe("IMProxySigner", function () {
  var proxy_address = "0xdaeee689e6fb3e0971ecffba4082a24cfb23ed48"
  var identity_manager_address = "0xeffd2f248e6ea7a756bb76415d88ce5d5cd44351"
  var signer = new IMProxySigner(proxy_address, new SimpleSigner(keypair), identity_manager_address);

  describe("getAddress", function() {
    it("returns its address", function(done) {
      expect(signer.getAddress()).to.equal(proxy_address);
      done();
    })
  })

  describe("signRawTx", function() {
    // TODO add many tx example or add gen tests
    var rawSrcTx = "f680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080"
    var srcTx = new Transaction(new Buffer(rawSrcTx, 'hex'));
    var srcTxJSON = srcTx.toJSON();
    var signedForwardTx = 'f9012a80850ba43b7400832fefd894effd2f248e6ea7a756bb76415d88ce5d5cd4435180b8c473b40a5c000000000000000000000000daeee689e6fb3e0971ecffba4082a24cfb23ed480000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001ba003d08b5374b09f02460b807664e80ef4fde09f7919708eb4ff32f1eb2c5c4dbaa063689475713da4fffcd861bcd04e307aa9df7454aea1e202b245ff5f82af4999'

    var rawForwardTx = 'f8ea80850ba43b7400832fefd894effd2f248e6ea7a756bb76415d88ce5d5cd4435180b8c473b40a5c000000000000000000000000effd2f248e6ea7a756bb76415d88ce5d5cd443510000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001c8080'
    var forwardTx = new Transaction(new Buffer(rawForwardTx, 'hex'));
    var forwardTxJSON = forwardTx.toJSON();

    var forwardToFuncSig = '73b40a5c'

    it('creates the forward tx with the same gasPrice, gasLimit, and nonce args as the src tx', function(done){
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          var signedTx = new Transaction(signedRawTx);
          var signedTxJSON = signedTx.toJSON()
          // nonce
          expect(signedTxJSON[0]).to.equal(srcTxJSON[0])
          // gasPrice
          expect(signedTxJSON[1]).to.equal(srcTxJSON[1])
          // gasLimit
          expect(signedTxJSON[2]).to.equal(srcTxJSON[2])
          done();
      });
    })

    it('creates the forward txn with "to" set to the identity manager', function(done){
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          var signedTx = new Transaction(signedRawTx);
          var signedTxJSON = signedTx.toJSON()
          // to
          expect(signedTxJSON[3]).to.equal(identity_manager_address)
          done();
      });
    })

    it("signs a forward tx", function(done) {
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          expect(signedRawTx).to.equal(signedForwardTx);
          done();
      });
    })

    it('signs a forward tx with the given key', function(done){
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          var txSigned = new Transaction(signedRawTx);
          expect(txSigned.getSenderPublicKey().toString('hex')).to.equal(util.stripHexPrefix(keypair.publicKey));
          done();
      });
    })

    it('create foward tx which calls forwardTo in the identity manager', function(done){
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          var txSigned = new Transaction(signedRawTx);
          var txSignedData = txSigned.data.toString('hex')
          var dataFunc = txSignedData.substr(0,8)
          expect(dataFunc).to.equal(forwardToFuncSig)
          done();
      });
    })

    it('creates the forward tx data with args from the src txn and the args are correctly ordered', function(done){
      signer.signRawTx(rawSrcTx,
        function(e, signedRawTx) {
          var txSigned = new Transaction(signedRawTx);
          var txSignedData = txSigned.data.toString('hex')

          var srcToAddress = srcTx.to.toString('hex')
          var srcValue = srcTx.value.toString('hex')
          var srcData = srcTx.data.toString('hex')

          var dataStringRemain = txSignedData
          var splitString

          // More verbose code for clarity
          // if seperator found, split array is greater than 1
          // makes sure arg ordering matches forwardTo function call

          // Arg 1 proxy address
          splitString = dataStringRemain.split(proxy_address.substr(2))
          expect(splitString.length).to.equal(2)
          dataStringRemain = splitString[1]

          // Arg 2 src to address
          splitString = dataStringRemain.split(srcToAddress)
          expect(splitString.length > 1).to.equal(true)
          dataStringRemain = splitString[1]

          // Arg 3 src value
          splitString = dataStringRemain.split(srcValue)
          expect(splitString.length > 1).to.equal(true)
          dataStringRemain = splitString[1]

          // Arg 4 src data
          splitString = dataStringRemain.split(srcData)
          expect(splitString.length > 1).to.equal(true)

          done();
      });
    })
  })
});
