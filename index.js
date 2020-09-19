const Web3 = require('web3')

const { Transaction } = require('ethereumjs-tx')
const { intToHex, bufferToHex, privateToAddress } = require('ethereumjs-util')

const { infuraToken, pk } = require('./configs.json')
const { nonce, gasPrice, gasLimit, to, value, data } = require('./tx.json')

const privateKey = Buffer.from(pk, 'hex',)

const txParams = {
  nonce: intToHex(Number(nonce)),
  gasPrice: intToHex(Number(gasPrice)),
  gasLimit: intToHex(Number(gasLimit)),
  to: to,
  value: intToHex(Number(value)),
  data: data,
}
console.log('Transaction details')
console.log(txParams)

// The second parameter is not necessary if these values are used
const tx = new Transaction(txParams, { chain: 'mainnet', hardfork: 'istanbul' })
tx.sign(privateKey)

if (
  tx.validate() &&
  bufferToHex(tx.getSenderAddress()) === bufferToHex(privateToAddress(privateKey))
) {
  console.log('Valid signature')
} else {
  console.error('Invalid signature')
  return;
}

console.log("The transaction's chain id is", tx.getChainId())

const serializedTx = tx.serialize()

console.log(`Signed tx: ${serializedTx.toString('hex')}`)

const web3 = new Web3(Web3.givenProvider || `https://mainnet.infura.io/v3/${infuraToken}`);

web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`, function(err, hash) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(hash);
});