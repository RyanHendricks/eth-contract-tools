* [ECRecovery](#ecrecovery)
  * [recover](#function-recover)

# ECRecovery


## *function* recover

ECRecovery.recover(hash, sig) `pure` `19045a25`

> Recover signer address from a message by using his signature

Inputs

| | | |
|-|-|-|
| *bytes32* | hash | bytes32 message, the hash is the signed message. What is recovered is the signer address. |
| *bytes* | sig | bytes signature, the signature is generated using web3.eth.sign() |


---