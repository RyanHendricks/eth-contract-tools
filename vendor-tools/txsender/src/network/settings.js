export const LOCAL_ID = 9999999999
export const INFURA_TOKEN = '8oUCPrUo9K5njhj6vbHy'
export const UPORT_ID = '2ok5ZL1QBDsQz8P9kXVdGZtpVEV7yLshvkY'
// 2ok5ZL1QBDsQz8P9kXVdGZtpVEV7yLshvkY uport ID
// 0x04788ed4c5fcda711d471395d28acf98faa22f5a70a68f7727dcdd8d3c2851b1af385f10e3cfcd56cd5eb8ad57088f1b641f95c88199de9ae6021caa149ab081ca
const scannerMap = {
  main: 'https://etherscan.io',
  ropsten: 'https://ropsten.etherscan.io',
  kovan: 'https://kovan.etherscan.io',
  rinkeby: 'https://rinkeby.etherscan.io'
}

export const metamaskNetworkMap = [{
  id: LOCAL_ID,
  name: 'Localhost',
  scanner: scannerMap.local
}, {
  id: 1,
  name: 'Main Ethereum Network',
  scanner: scannerMap.main
}, {
  id: 2,
  name: 'Morden (test network)'
}, {
  id: 3,
  name: 'Ropsten (test network)',
  scanner: scannerMap.ropsten
}, {
  id: 4,
  name: 'Rinkeby (test network)',
  scanner: scannerMap.rinkeby
}, {
  id: 42,
  name: 'Kovan (test network)',
  scanner: scannerMap.kovan
}]

export const infuraNetworkMap = [{
  id: 1,
  protocol: 'https',
  host: `mainnet.infura.io/${INFURA_TOKEN}`,
  name: 'Mainnet (production)',
  scanner: scannerMap.main
}, {
  id: 3,
  protocol: 'https',
  host: `ropsten.infura.io/${INFURA_TOKEN}`,
  name: 'Ropsten (test network)',
  scanner: scannerMap.ropsten
}, {
  id: 4,
  protocol: 'https',
  host: `rinkeby.infura.io/${INFURA_TOKEN}`,
  name: 'Rinkeby (test network)',
  scanner: scannerMap.rinkeby
}, {
  id: 42,
  protocol: 'https',
  host: `kovan.infura.io/${INFURA_TOKEN}`,
  name: 'Kovan (test network)',
  scanner: scannerMap.kovan
}]

export const infuraLocalNetwork = {
  id: LOCAL_ID,
  host: 'localhost:8545',
  name: 'Local'
}

export const providerMap = {
  metamask: {
    id: 1,
    name: 'Metamask/Mist',
    disabled: true
  },
  infura: {
    id: 2,
    name: 'Infura',
    disabled: false
  },
  uport: {
    id: 3,
    name: 'UPort',
    disabled: false
  },
  local: {
    id: LOCAL_ID,
    name: 'Local',
    disabled: true
  }
}

export const getNetworksByProvider = (providerId, withLocal = false) => {
  switch (providerId) {
    case providerMap.metamask.id:
      return [...metamaskNetworkMap]
    case providerMap.infura.id:
      const networks = [...infuraNetworkMap]
      if (withLocal) {
        networks.push(infuraLocalNetwork)
      }
      return networks
    default:
      return []
  }
}

export const getNetworkById = (networkId, providerId, withLocal = false) => {
  const networkMap = getNetworksByProvider(providerId, withLocal)
  return networkMap.find((net) => net.id === networkId) || {}
}

export const getScannerById = (networkId, providerId) => {
  return getNetworkById(networkId, providerId).scanner
}
