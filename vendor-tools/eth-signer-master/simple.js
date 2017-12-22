module.exports = {
  txutils: require('./lib/txutils.js'),
  signer: require('./lib/signer.js'),
  Wallet: require('./lib/wallet.js'),
  signers: {
    SimpleSigner: require('./lib/simple_signer.js'),
    ProxySigner: require('./lib/proxy_signer.js')
  },

  generators: {
    KeyPair: require('./lib/generators/key_pair.js'),
    Random: require('./lib/generators/random.js')
  }
};
