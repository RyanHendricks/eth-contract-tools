import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Field, reduxForm} from 'redux-form/immutable'
import {TextField} from 'redux-form-material-ui'
import {Checkbox, RaisedButton} from 'material-ui'
import {setWallet, toggleURL, updateTxPrices} from '../../redux/tx/tx'
import validator from './validator'

const mapStateToProps = (state) => ({
  isWalletUploaded: !!state.get('tx').wallet,
  wallet: state.get('tx').wallet,
  urls: state.get('tx').urls,
  block: state.get('tx').block,
  txError: state.get('tx').error,
  valueEth: state.get('tx').value,
  valuePrice: state.get('tx').valuePrice,
  txPrice: state.get('tx').txPrice,
  totalPrice: state.get('tx').totalPrice,
  multiTotalPrice: state.get('tx').multiTotalPrice,
  txEthPrice: state.get('tx').txEthPrice,
  totalEthPrice: state.get('tx').totalEthPrice,
  multiTotalEthPrice: state.get('tx').multiTotalEthPrice,
  usdRate: state.get('tx').usdRate,
  initialValues: {
    gasPrice: state.get('tx').gasPrice
  }
})

const mapDispatchToProps = (dispatch) => ({
  setWallet: (wallet) => dispatch(setWallet(wallet)),
  toggleURL: (url, add) => dispatch(toggleURL(url, add)),
  updateTxPrices: (to, value, data, gasPrice) => dispatch(updateTxPrices(to, value, data, gasPrice))
})

@connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
// noinspection JSUnusedGlobalSymbols
@reduxForm({
  form: 'TxForm', validate: (values) => {
    const errors = {}
    errors.to = validator.address(values.get('to'), false)
    errors.value = validator.positiveNumberOrZero(values.get('value'), false)
    errors.gasPrice = validator.positiveInt(values.get('gasPrice'))

    if (values.get('data') && !/^0x[0-9a-f]+$/.test(values.get('data'))) {
      errors.data = 'Should be valid hex code starting with the 0x'
    }

    return errors
  }
})
class TxPage extends Component {
  handleFileUploaded = (e) => {
    const jsonWallet = JSON.parse(e.target.result)
    if (jsonWallet.hasOwnProperty('Crypto')) {
      jsonWallet['crypto'] = jsonWallet.Crypto
    }
    this.props.setWallet(jsonWallet)
  }

  handleUploadClick = () => {
    this.refs.fileInput.click()
  }

  handleUploadFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = this.handleFileUploaded
    reader.readAsText(file)
  }

  handleURLCheck = (e, isInputChecked) => {
    this.props.toggleURL(e.target.value, isInputChecked)
    this.props.updateTxPrices(this.refs.to.value, this.refs.value.value, this.refs.data.value, this.refs.gasPrice.value)
  }

  handleToChange = (e, newValue) => {
    this.props.updateTxPrices(newValue, this.refs.value.value, this.refs.data.value, this.refs.gasPrice.value)
  }

  handleValueChange = (e, newValue) => {
    this.props.updateTxPrices(this.refs.to.value, newValue, this.refs.data.value, this.refs.gasPrice.value)
  }

  handleDataChange = (e, newValue) => {
    this.props.updateTxPrices(this.refs.to.value, this.refs.value.value, newValue, this.refs.gasPrice.value)
  }

  handleGasPriceChange = (e, newValue) => {
    this.props.updateTxPrices(this.refs.to.value, this.refs.value.value, this.refs.data.value, newValue)
  }

  render() {
    return (
      <form ref='txForm' onSubmit={this.handleSubmit}>
        <Field component={TextField} style={{width: '100%'}} ref='to' name='to' floatingLabelText='To'
               onChange={this.handleToChange}/>
        <Field component={TextField} style={{width: '100%'}} ref='value' name='value' floatingLabelText='Value (ether)'
               onChange={this.handleValueChange}/>
        <Field component={TextField} style={{width: '100%'}} ref='data' name='data' floatingLabelText='Data'
               onChange={this.handleDataChange}/>
        <Field component={TextField} style={{width: '100%'}} ref='gasPrice' name='gasPrice' floatingLabelText='Gas Price (wei)'
               onChange={this.handleGasPriceChange}/>

        {this.props.txError ? <p style={{color: 'rgb(244, 67, 54)'}}>{this.props.txError}</p> : ''}

        <Field component={TextField} style={{width: '75%', marginRight: '25px'}} name='block'
               floatingLabelText='Block Number'/>
        <span>current <b>{this.props.block}</b></span>

        <RaisedButton
          label={this.props.isWalletUploaded ? 'Change Wallet File' : 'Upload Wallet File'}
          style={{marginRight: '35px'}}
          onTouchTap={this.handleUploadClick}/>
        <input
          onChange={this.handleUploadFile}
          ref='fileInput'
          type='file'
          style={{display: 'none'}}
        />

        <input type='file' ref='fileInput' style={{display: 'none'}} onChange={this.handleUploadFile}/>

        <Field component={TextField} style={{width: '63%'}} type='password' name='password'
               floatingLabelText='Password'/>

        {this.props.isWalletUploaded ? <TextField style={{width: '100%'}} disabled={true} value={this.props.wallet.address} hintText='From' /> : ''}

        <div style={{marginTop: '30px', marginBottom: '20px'}}>
          {this.props.urls.entrySeq().map(([url, checked]) => (
            <Checkbox key={url} label={url} value={url} onCheck={this.handleURLCheck} checked={!!checked}/>
          ))}
        </div>

        {this.props.multiTotalPrice > 0 ? <div>
          <hr />
          <p>Current ETH/USD rate: <b>{this.props.usdRate}</b></p>
          <table style={{width: '100%', marginTop: '15px', marginBottom: '20px'}}>
            <thead>
            <tr>
              <th>Value</th>
              <th>Gas Fee</th>
              <th>Total</th>
              <th>Multi Total</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{this.props.valueEth} ETH</td>
              <td>{this.props.txEthPrice} ETH</td>
              <td>{this.props.totalEthPrice} ETH</td>
              <td><b>~ {this.props.multiTotalEthPrice} ETH</b></td>
            </tr>
            <tr>
              <td>{this.props.valuePrice} $</td>
              <td>{this.props.txPrice} $</td>
              <td>{this.props.totalPrice} $</td>
              <td><b>~ {this.props.multiTotalPrice} $</b></td>
            </tr>
            </tbody>
          </table>
          <hr />
        </div> : ''}
      </form>
    )
  }
}

export default TxPage
