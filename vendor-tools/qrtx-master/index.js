var qr = new (require("qrcode-reader"))()
var ethtx = require("ethereumjs-tx")
var b64 = require("base64-js").toByteArray
var instascan = require("instascan")

var chains = {
  1: {name: "Mainnet", prefix: "", api: "api"},
  3: {name: "Ropsten", prefix: "ropsten.", api: "ropsten"},
  4: {name: "Rinkeby", prefix: "rinkeby.", api: "rinkeby"},
  42: {name: "Kovan", prefix: "kovan.", api: "kovan"},
}

var txHex
var tx

qr.callback = function (err, result) {
  if (result) {
    var raw = new Buffer(b64(result.result))
    txHex = "0x" + raw.toString("hex")
    tx = new ethtx(raw)
    function hex (s) { return tx[s].toString("hex") }
    function int (s) { return parseInt(hex(s), 16) }
    var data = {
      from: hex("from"),
      to: hex("to"),
      nonce: int("nonce"),
      value: int("value"),
      data: hex("data"),
      gasLimit: int("gasLimit"),
      gasPrice: int("gasPrice"),
      chain: tx.getChainId(),
    }
    showTx(data)
  }
  else {
    alert("QR code didn't scan. Try again! (Error: " + err + ")")
    location.reload()
  }
}

window.scan = function () {
  var scanner = new instascan.Scanner({
    video: document.getElementById('preview')
  })
  scanner.addListener('scan', function (result) {
    scanner.stop()
    qr.callback(null, {result: result})
  })
  instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]).catch(function (e) {
        console.log(e)
      })
    } else {
      console.log('No cameras found.')
    }
  }).catch(function (e) {
    console.log(e)
  })
}

upload.onchange = function () {
  var reader = new FileReader()
  reader.onload = function () {
    qr.decode(reader.result)
  }
  reader.readAsDataURL(this.files[0])
}

function showTx (data) {
  var prefix = chains[data.chain].prefix
  txFrom.innerHTML =
    '<a href="https://' + prefix + 'etherscan.io/address/0x' + data.from + '" target="_blank">' +
       data.from.substr(0, 16) + "..." + "</a>"
  txTo.innerHTML =
    '<a href="https://' + prefix + 'etherscan.io/address/0x' + data.to + '" target="_blank">' +
       data.to.substr(0, 16) + "..." + "</a>"
  txChain.innerText = chains[data.chain].name || "(unknown chain " + data.chain + ")"
  txNonce.innerText = data.nonce
  txValue.innerText = data.value || 0
  txData.innerText = data.data || "(no data)"
  txGasLimit.innerText = data.gasLimit
  txGasPrice.innerText = data.gasPrice
  document.body.className = "step2"
}

window.broadcast = function () {
  document.body.className = "step3"
  var chainId = tx.getChainId()

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://" + chains[chainId].api + ".etherscan.io/api", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      var result = JSON.parse(xhr.responseText)
      console.log(result)
      if (result.error) {
        waiting.innerText = result.error.message
      } else {
        var link = document.createElement("A")
        link.setAttribute("href", "https://" + chains[chainId].prefix + "etherscan.io/tx/" + result.result)
        link.setAttribute("target", "_blank")
        link.innerText = result.result.substr(0, 16) + "..."
        waiting.innerHTML = ""
        waiting.appendChild(link)
      }
    }
  }
  xhr.send("module=proxy&action=eth_sendRawTransaction&hex=" + txHex)
}