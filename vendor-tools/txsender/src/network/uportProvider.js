import { Connect, QRUtil } from 'uport-connect'
import { decode, isMNID } from 'mnid'
import { INFURA_TOKEN, UPORT_ID } from './settings'

const customOpenQr = (data, cancel) => {
  console.log('--UportProvider#customOpenQr', data)
  QRUtil.openQr(data, cancel)
}

export const decodeMNIDaddress = (mnidAddress) => {
  return isMNID(mnidAddress) ? decode(mnidAddress) : 'null'
}
const uport = new Connect('Ryan Hendricks\'s new app', {
  clientId: '2ok5ZL1QBDsQz8P9kXVdGZtpVEV7yLshvkY',
  network: 'rinkeby',
  signer: SimpleSigner('b20006c2b76a56cf160f54a92e2b61137751dcf4986eec771e4fa4c95c95fd1e')
})

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

const uportProvider = new Connect('ChronoBankTest', {
  uriHandler: customOpenQr,
  infuraApiKey: INFURA_TOKEN,
  closeUriHandler: QRUtil.closeQr,
  clientId: UPORT_ID
})

export default uportProvider
