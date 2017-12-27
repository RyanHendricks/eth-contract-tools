// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import checksign_artifacts from '../../build/contracts/CheckSign.json';

// CheckSign is our usable abstraction, which we'll use through the code below.
var CheckSign = contract(checksign_artifacts);

var accounts;
var account;
var gasPrice;

function keccak256(...args) {
  args = args.map(arg => {
    if (typeof arg === 'string') {
      if (arg.substring(0, 2) === '0x') {
          return arg.slice(2)
      } else {
          return web3.toHex(arg).slice(2)
      }
    }

    if (typeof arg === 'number') {
      return leftPad((arg).toString(16), 64, 0)
    } else {
      return ''
    }
  })

  args = args.join('')

  return web3.sha3(args, { encoding: 'hex' })
}

var convertSig = sig => {
  return {r: '0x' + sig.substr(2, 64),
  s: '0x' + sig.substr(66, 64),
  v: parseInt(sig.substr(130, 2),16)}
}

function signString(coinbase, text, cb) {
  /*
  * Sign a string and return a signature (r, s, v) used by ecrecover to regenerate the coinbase address;
  */
  let sha = web3.sha3(text); // is already 'Ox.....', no need to add 'Ox' upfront
  web3.eth.sign(coinbase, sha, (err, sig) => {cb(sha, convertSig(sig))});
}

function signTypedData(coinbase, data, cb) {
  /*
  * Sign a typed data and return a signature (r, s, v)
  */
  web3.currentProvider.sendAsync({method: 'eth_signTypedData',
  params: [data, coinbase],
  jsonrpc: '2.0',
  id: 1},
  cb);
}

function typedSign(coinbase, value, cb) {
  /*
  * Sign TypedData
  */
  const data = [{ 'type': 'uint', 'name': 'message', 'value': value }];
  signTypedData(coinbase, data, (err,res) => {cb(data, convertSig(res.result))})
}

function typedSignDb(coinbase, value, msg, cb) {
  const data = [{ 'type': 'string', 'name': 'Message', 'value': msg },
  { 'type': 'uint', 'name': 'Amount', 'value': value }];
  signTypedData(coinbase, data, (err,res) => {cb(data, convertSig(res.result))})
}

window.App = {
  start: function() {
    // Bootstrap the CheckSign abstraction for Use.
    CheckSign.setProvider(web3.currentProvider);
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      //self.getLit();
    });

    // get gas price
    web3.eth.getGasPrice(function(err, price){
      console.log("Gas price:", Number(price))
      gasPrice = price;
    })

    // polling for change of account
    setInterval(() => {
      web3.eth.getAccounts((err, accs) => {
        if (accs[0] != account) {
          accounts = accs;
          account = accounts[0];
          document.getElementById("account").innerText = account;

          web3.eth.getBalance(account, (err, bal) => {
            document.getElementById("balance").innerText = web3.fromWei(bal, 'ether');
          })

        }
      });


    }, 100);
  },

  simpleSign: function() {
    document.getElementById("resSimple").innerText = "wait...";
    var self = this;
    var msg = 'Edouard FISCHER : send € 123.00';
    signString(account, msg, (sha, sig) => {
      document.getElementById("resSimple").innerText = "checking...";
      self.checkSign(sha, sig,
        result => {
          console.log('Is signed with account:', result);
          document.getElementById("resSimple").innerText = result;
        })
      })
    },

    singleSign: function() {
      document.getElementById("resSingle").innerText = "wait...";
      var self = this;
      typedSign(account, 123, (typedData, sig) => {
        document.getElementById("resSingle").innerText = "checking...";
        self.checkTypedSign(typedData, sig, result => {
          console.log("Is signed with account:", result);
          document.getElementById("resSingle").innerText = result;
        })
      })
    },

    doubleSign: function() {
      document.getElementById("resDouble").innerText = "wait...";
      var self = this;
      typedSignDb(account, 1200, 'By signing, I commit to send this amount (€)', (typedData, sig) => {
        document.getElementById("resDouble").innerText = "checking...";
        self.checkTypedSignDb(typedData, sig, result => {
          console.log("Is signed with account:", result);
          document.getElementById("resDouble").innerText = result;
        })
      })
    },

    getLit: function() {
      CheckSign.deployed().then(instance => {
        return instance.getLit.call();
      }).then(val => { console.log("literal:", val);})
    },


    checkTypedSign: function(typedData, sig, cb) {
      /*
      * Ask CheckSign smart contract to recover coinbase address from typed data hash and signature
      */
      console.log("---checkTypedSign---");
      var inst;
      var val;
      CheckSign.deployed().then(instance => {
        inst = instance;
        val = typedData[0].value;

        return inst.recoverTypedSignAddr.estimateGas(val, sig.v, sig.r, sig.s);
      }).then(result => {
        console.log("Gas cost:", web3.fromWei(result * gasPrice, 'ether'), ' ether');
        console.log("Gas cost:", 300 * web3.fromWei(result * gasPrice, 'ether'), ' €');

        return inst.recoverTypedSignAddr.call(val, sig.v, sig.r, sig.s);
      }).then(cb).catch(err => {console.log('Got error:', err)})

    },

    checkTypedSignDb: function(typedData, sig, cb) {
      /*
      * Ask CheckSign smart contract to recover coinbase address from typed data hash and signature
      */
      console.log("---checkTypedSignDB---");
      var inst;
      var val;
      var msg;
      CheckSign.deployed().then(instance => {
        inst = instance;
        val = typedData[1].value;
        msg = typedData[0].value;
        return inst.recoverTypedSignAddrDb.estimateGas(val, msg, sig.v, sig.r, sig.s);
      }).then(result => {
        console.log("Gas cost:", web3.fromWei(result * gasPrice, 'ether'), ' ether');
        console.log("Gas cost:", 300 * web3.fromWei(result * gasPrice, 'ether'), ' €');

        return inst.recoverTypedSignAddrDb.call(val, msg, sig.v, sig.r, sig.s);

      }).then(cb).catch(err => {console.log('Got error:', err)})
    },

    checkSign: function(sha, sig, cb) {
      /*
      * Ask CheckSign smart contract to recover coinbase address from sha and signature
      */
      console.log("---checkSign---");
      var inst;
      CheckSign.deployed().then(instance => {
        inst = instance;
        return  inst.recoverAddr.estimateGas(sha, sig.v, sig.r, sig.s)
      }).then(result => {
        console.log("Gas cost:", web3.fromWei(result * gasPrice, 'ether'), ' ether');
        console.log("Gas cost:", 300 * web3.fromWei(result * gasPrice, 'ether'), ' €');
        return inst.recoverAddr.call(sha, sig.v, sig.r, sig.s)
      }).then(cb).catch(err => {console.log('got error:', err)})
    }

  };

  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }

    App.start();
  });
