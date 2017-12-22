import Immutable from 'immutable'
import Web3 from 'web3'
import walletProvider from '../../network/walletProvider'
import Web3Provider from '../../network/Web3Provider'
import {store} from '../configureStore'
import axios from 'axios'
import { Connect, SimpleSigner } from 'uport-connect'


const TX_SET_WALLET = 'tx/SET_WALLET'
const TX_TOGGLE_URL = 'tx/TOGGLE_URL'
const TX_NEW_BLOCK = 'tx/NEW_BLOCK'
const TX_PRICES = 'tx/PRICES'
const TX_ERROR = 'tx/ERROR'
const TX_REMAINING = 'tx/REMAINING'
const TX_RESULT = 'tx/RESULT'
const TX_PRICES_FETCH = 'tx/PRICES_FETCH'

const PRIMARY_URL = 'https://mainnet.infura.io/PVe9zSjxTKIP3eAuAHFA'

const commonWeb3 = new Web3(new Web3.providers.HttpProvider(PRIMARY_URL))
Web3Provider.setWeb3(commonWeb3)

const uport = new Connect('Ryan Hendricks\'s new app', {
  clientId: '2ok5ZL1QBDsQz8P9kXVdGZtpVEV7yLshvkY',
  network: 'rinkeby or ropsten or kovan',
  signer: SimpleSigner('b20006c2b76a56cf160f54a92e2b61137751dcf4986eec771e4fa4c95c95fd1e')
})

// Request credentials to login
uport.requestCredentials({
  requested: ['name', 'phone', 'country'],
  notifications: true // We want this if we want to recieve credentials
})
.then((credentials) => {
  // Do something
})

// Attest specific credentials
uport.attestCredentials({
  sub: THE_RECEIVING_UPORT_ADDRESS,
  claim: {
    CREDENTIAL_NAME: CREDENTIAL_VALUE
  },
  exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
})

const initialState = {
  wallet: null,
  remaining: null,
  result: null,
  block: '...',
  urls: new Immutable.Map({
    [PRIMARY_URL]: 1 /** PUT YOUR URLS HERE */
  }),
  gasPrice: commonWeb3.eth.gasPrice,
  pricesFetch: false,
  error: null,
  value: null,
  valuePrice: null,
  txPrice: null,
  totalPrice: null,
  multiTotalPrice: null,
  usdRate: null,
  txEthPrice: null,
  totalEthPrice: null,
  multiTotalEthPrice: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TX_SET_WALLET:
      return {
        ...state,
        wallet: action.wallet
      }
    case TX_NEW_BLOCK:
      return {
        ...state,
        block: action.block
      }
    case TX_REMAINING:
      return {
        ...state,
        remaining: action.remaining
      }
    case TX_ERROR:
      return {
        ...state,
        error: action.error,
        pricesFetch: false
      }
    case TX_RESULT:
      return {
        ...state,
        result: action.result,
        remaining: null
      }
    case TX_TOGGLE_URL:
      return {
        ...state,
        urls: state.urls.set(action.url, action.add)
      }
    case TX_PRICES_FETCH:
      return {
        ...state,
        pricesFetch: true
      }
    case TX_PRICES:
      return {
        ...state,
        value: action.value,
        valuePrice: action.valuePrice,
        txPrice: action.txPrice,
        totalPrice: action.totalPrice,
        multiTotalPrice: action.multiTotalPrice,
        txEthPrice: action.txEthPrice,
        totalEthPrice: action.totalEthPrice,
        multiTotalEthPrice: action.multiTotalEthPrice,
        usdRate: action.usdRate
      }
    default:
      return state
  }
}

setInterval(async () => {
  store.dispatch({type: TX_NEW_BLOCK, block: await Web3Provider.getBlockNumber()})
}, 3000)

const BLOCK_DELAY = 2

const toWei = (v) => v * 1000000000000000000
const fromWei = (v) => v / 1000000000000000000

const getCheckedURLs = (urls) => {
  urls = urls.toObject()
  let result = []
  for (let i in urls) {
    if (urls.hasOwnProperty(i)) {
      if (urls[i] === 1) {
        result.push(i)
      }
    }
  }
  return result
}

export const setWallet = (wallet) => ({type: TX_SET_WALLET, wallet})
export const toggleURL = (url, add) => ({type: TX_TOGGLE_URL, url, add})

export const updateTxPrices = (to, value, data, gasPrice) => async (dispatch, getState) => {
  if (!to || !(value || data)) {
    return
  }

  dispatch({type: TX_ERROR, error: null})
  dispatch({type: TX_PRICES_FETCH})

  const prices = await axios.get('https://coinmarketcap-nexuist.rhcloud.com/api/eth')
  let usdRate = fromWei(prices.data.price.usd)

  value = toWei(value)

  const valuePrice = Math.round((value * usdRate) * 100) / 100

  commonWeb3.eth.estimateGas({to, value, data}, (error, estimateGas) => {
    if (error) {
      dispatch({type: TX_ERROR, error: 'Estimate gas error: ' + error.message})
      return
    }

    const providersNum = getCheckedURLs(getState().get('tx').urls).length

    const txPrice = Math.round((estimateGas * gasPrice * usdRate) * 100) / 100
    const totalPrice = valuePrice + txPrice
    const multiTotalPrice = totalPrice * providersNum

    const txEthPrice = fromWei(estimateGas * gasPrice)
    const totalEthPrice = fromWei(value) + txEthPrice
    const multiTotalEthPrice = totalEthPrice * providersNum

    dispatch({
      type: TX_PRICES,
      valuePrice, txPrice, totalPrice, multiTotalPrice, usdRate: prices.data.price.usd,
      value: fromWei(value), txEthPrice, totalEthPrice, multiTotalEthPrice
    })
  })
}

export const transaction = (urls, from, to, value, data, block, wallet, password, gasPrice) => async (dispatch) => {
  dispatch({type: TX_REMAINING, remaining: 0}) // show processing...

  urls = getCheckedURLs(urls)
  value = toWei(value)
  block = parseInt(block, 10)

  let first = true
  let remainingTxs = urls.length
  let remainingBlocks = 0

  let result = new Immutable.List()

  for (let url of urls) {
    let provider
    try {
      provider = walletProvider(wallet, password, url)
    } catch (error) {
      result = result.push([url, error.toString()])
      remainingTxs--
      if (remainingTxs === 0) {
        dispatch({type: TX_RESULT, result})
      }
      continue
    }

    const web3 = new Web3()
    web3.setProvider(provider)

    if (first) {
      const currentBlock = await Web3Provider.getBlockNumber()
      remainingBlocks = block - currentBlock - BLOCK_DELAY
      dispatch({type: TX_REMAINING, remaining: remainingBlocks})
    }

    const callback = () => {
      web3.eth.sendTransaction({from, to, value, gasPrice, data}, function (error, hash) {
        if (error) {
          result = result.push([url, error.toString()])
        } else {
          result = result.push([url, hash])
        }
        remainingTxs--
        if (remainingTxs === 0) {
          dispatch({type: TX_RESULT, result})
        }
      })
    }

    const filter = web3.eth.filter('latest')
    filter.watch(async (e, r) => {
      if (e) {
        return
      }
      const blockData = await Web3Provider.getBlock(r, true)
      const currentBlock = blockData.number

      if (block - currentBlock - BLOCK_DELAY < remainingBlocks) {
        remainingBlocks = block - currentBlock - BLOCK_DELAY
        dispatch({type: TX_REMAINING, remaining: remainingBlocks})
      }

      if (block - currentBlock <= BLOCK_DELAY) {
        filter.stopWatching(() => {
        })
        callback()
      }
    })

    first = false
  }
}
