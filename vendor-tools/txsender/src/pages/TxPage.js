import React, {Component} from 'react'
import {connect} from 'react-redux'
import {RaisedButton} from 'material-ui'
import TxForm from '../components/forms/TxForm'
import {transaction} from '../redux/tx/tx'

const mapStateToProps = (state) => ({
  isWalletUploaded: !!state.get('tx').wallet,
  wallet: state.get('tx').wallet,
  urls: state.get('tx').urls,
  remaining: state.get('tx').remaining,
  result: state.get('tx').result
})

const mapDispatchToProps = (dispatch) => ({
  tx: (urls, from, to, value, data, block, wallet, password, gasPrice) => dispatch(transaction(urls, from, to, value, data, block, wallet, password, gasPrice))
})

@connect(mapStateToProps, mapDispatchToProps)
class TxPage extends Component {
  handleSubmit = (values) => {
    this.props.tx(
      this.props.urls,
      this.props.wallet.address,
      values.get('to'),
      values.get('value'),
      values.get('data'),
      values.get('block'),
      this.props.wallet,
      values.get('password'),
      values.get('gasPrice')
    )
  }

  handleSend = () => {
    this.refs.txForm.getWrappedInstance().submit()
  }

  handleReset = () => {
    window.location.reload()
  }

  render() {
    return (
      <div style={{width: '600px', margin: '50px auto 0'}}>
        <TxForm ref='txForm' onSubmit={this.handleSubmit}/>

        {this.props.result === null ? (this.props.remaining === null ? <RaisedButton
          label={'Send'}
          style={{margin: '30px 0 0'}}
          primary
          fullWidth
          disabled={!this.props.isWalletUploaded}
          onTouchTap={this.handleSend}/> : (
          <p style={{textAlign: 'center', marginTop: '40px'}}>
            {this.props.remaining > 0 ? (this.props.remaining + ' blocks remaining...') : 'Processing...'}
          </p>
        )) : (<div style={{marginTop: '35px'}}>
          {this.props.result.valueSeq().map(([url, r]) => (
            <p key={url}><b>{url}</b>: <br/><a href={'https://etherscan.io/tx/' + r} target='_blank'>{r}</a></p>
          ))}
          <RaisedButton label={'Reset'} style={{margin: '30px 0 0'}} fullWidth onTouchTap={this.handleReset}/>
        </div>)}
      </div>
    )
  }
}

export default TxPage
