// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import channels_artifacts from '../../build/contracts/Channels.json';

// CheckSign is our usable abstraction, which we'll use through the code below.
var Channels = contract(channels_artifacts);

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

function typedSign(coinbase, channel, to, value, cb) {
  /*
  * Sign TypedData
  */
  const data = [
    { 'type': 'string',  'name': 'Order',   'value': 'Transfer amount' },
    { 'type': 'bytes32', 'name': 'Channel', 'value': channel },
    { 'type': 'address', 'name': 'To',      'value': to},
    { 'type': 'uint',    'name': 'Amount',  'value': value}
  ];
  signTypedData(coinbase, data, (err,res) => {cb(data, res.result)})
}

window.App = {
  start: function() {
    // Bootstrap the CheckSign abstraction for Use.
    Channels.setProvider(web3.currentProvider);
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

  createChannel: function() {
    var self = this;
    let duration = parseInt(document.getElementById('duration').innerText);
    let value = parseInt(document.getElementById('value').innerText);
    var channel;
    var validUntil;

    Channels.deployed().then(instance => {
      return instance.createChannel(duration, {from: account, value: value})
    }).then(result => {
      let logs = result.logs;
      for log in logs {
        if (log.event == 'LogNewChannel') {
          channel = log.args.channel;
          validUntil = log.args.validUntil;
        }
        document.getElementById("channel").innerText = channel;
        document.getElementById("validity").innerText = validUntil;
      }
    }).catch(err => {console.log('Got error:', err)})
  },

  microPayment: function() {
    var self = this;
    let channel = document.getElementById("channel").innerText;
    let payment = document.getElementById("payment").innerText;
    let to = document.getElementById("recipient").innerText;
    typedSign(account, channel, to, payment, (data, sig) => {
      document.getElementById("signature").innerText = sig;
    });
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
