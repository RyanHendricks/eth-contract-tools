# Eth-Signer

A minimal ethereum javascript signer.

This is a fork of eth-lightwallet and will not be backwards compatible.

TODO update docs and example code. See tests for the time being.

## Get Started

```
npm install eth-signer
```

The `eth-signer` package contains `dist/eth-signer.min.js` that can be included in an HTML page:

```html
<html>
  <body>
    <script src="eth-signer.min.js"></script>
  </body>
</html>
```

The file `eth-signer.min.js` exposes the global object `EthSigner` to the browser.


## Tests

Run all tests:

```
npm run test
npm run coverage
```

[BIP39]: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
[BIP32]: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

## License

MIT License.

## Usage of meta transactions
In order to sign and send meta tx there are a few steps that has to be taken. A user first has to sign the raw tx, then send it to a relay service. The relay service then verifies the meta signature and after that sends the tx to the ethereum network.

### Sign a metaTx
```js
var proxyAddress = // the address of your proxy contract
var metaIdentityManagerAddress = // the address of the metaIdentityManager contract
var relayAddress = // the address of the txRelay contract
var txSenderAddress = // the address of the service that is sending your tx
var whitelistOwner = // the owner of a specific whitelist in the txRelay contract. Can be the zero address for no whitelist.
var keyPair = // your keypair that will be used to meta sign a transaction

var relaySigner = new TxRelaySigner(keypair, relayAddress, txSenderAddress, whitelistOwner);
var signer = new MIMProxySigner(proxyAddress, relaySigner, metaIdentityManagerAddress);

var rawTx = // a raw tx that you want to send
// IMPORTANT - the raw tx above has to have the nonce coresponding to your
// keypairs address in the txRelay contract. If different the tx will fail.

signer.signRawTx(rawTx, (error, metaSignedRawTx) => {
  // send tx to relay service
})
```


### Verify signature of a rawMetaTx
The relay service will want to verify that the metaTx it's relaying has a valid signature in order to avoid sending invalid txs. This can be done in the following way:
```js
var decodedMetaTx = TxRelaySigner.decodeMetaTx(metaSignedRawTx)
txRelay.getNonce(decodedMetaTx.claimedAddress).then(nonce => {
  nonce = nonce.toString() // the nonce has to be a string
  var validMetaSig = TxRelaySigner.isMetaSignatureValid(txRelay.address, decodedMetaTx, nonce)
  if (validMetaSig) {
    // send the tx
  }
})
```

### Sign and send tx to network
The raw meta tx that is sent to the relay can be signed with a simpleSigner:
```js
var metaSignedRawTx = // the meta signed tx from above
// IMPORTANT - since the user won't know the nonce of the sender address it will have to provide it
var Transaction = require('ethereumjs-tx');
var tx = new Transaction(Buffer.from(metaSignedRawTx, 'hex'))
tx.nonce = // the nonce of sender address
var rawTx = tx.serialize().toString('hex')

var keypair = // sender keypair
var signer = SimpleSigner(keypair)
signer.signRawTx(rawTx, (error, signedRawTx) => {
  // send tx to ethereum network
})
```


### Use IdentityManager without metaTxs
In the MetaIdentityManager contract it is possible to sign transactions directly. If you want to sign a tx in this way you can do the following:
```js
var simpleSigner = SimpleSigner(keypair)
var signer = new MIMProxySigner(proxyAddress, simpleSigner, metaIdentityManagerAddress);

var rawTx = // a raw tx that you want to send
signer.signRawTx(rawTx, (error, metaSignedRawTx) => {
  // send tx to ethereum network
})
```
