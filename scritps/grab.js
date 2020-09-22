const BN = require('bn.js');
const Web3 = require('web3');

const { Transaction } = require('ethereumjs-tx');
const { intToHex, bufferToHex, privateToAddress } = require('ethereumjs-util');
const { toChecksumAddress } = require('web3-utils');

const { infuraToken, pk } = require('../settings/configs.json');
const { to, nonce, gasPrice } = require('../settings/tx.json');

const chain = 'mainnet',
  hardfork = 'istanbul';

const privateKey = Buffer.from(pk, 'hex',);

async function getTxParams(inputParams) {
  let { to } = inputParams || {}
  let { nonce } = inputParams || {}
  let { gasPrice } = inputParams || {}

  if (to === "" || to === undefined) {
    console.error('Transaction "to" must not be empty.');
    return;
  }

  const gasLimit = "21000";
  const data = '0x';
  let from = `0x${privateToAddress(privateKey).toString('hex')}`;

  const web3 = new Web3(Web3.givenProvider || `https://${chain}.infura.io/v3/${infuraToken}`);

  try {
    from = toChecksumAddress(from)
  } catch(e) {
    console.error('invalid ethereum address', e.message);
    return;
  }

  const txParams = {
    from: from,
    gasLimit: intToHex(Number(gasLimit)),
    to: to,
    data: data,
  }

  nonce = (nonce !== "") ? nonce : await web3.eth.getTransactionCount(from, 'pending');
  txParams.nonce = intToHex(Number(nonce));

  let balance = await web3.eth.getBalance(from);

  let fee = (new BN(gasPrice)).mul(new BN(gasLimit));
  if ((new BN(balance)).lte(fee)) {
    console.error('Zero or negative `tx.value` result expected.');
    return;
  }

  let balanceToSend = (new BN(balance)).sub(fee);
  txParams.value = intToHex(Number(balanceToSend));

  console.log(txParams);

  if (!(balanceToSend.add(fee).eq(new BN(balance)))) {
    throw new Error('Wrong fee count');
  }

  return txParams;
}

async function signAndBroadcast(txParams) {
  console.log('Transaction details');
  console.log(txParams);

  // The second parameter is not necessary if these values are used
  const tx = new Transaction(txParams, { chain: chain, hardfork: hardfork });
  tx.sign(privateKey)

  if (
    tx.validate() &&
    bufferToHex(tx.getSenderAddress()) === bufferToHex(privateToAddress(privateKey))
  ) {
    console.log('Valid signature');
  } else {
    console.error('Invalid signature');
    return;
  }

  console.log("The transaction's chain id is", tx.getChainId());

  const serializedTx = tx.serialize();

  console.log(`Signed tx: ${serializedTx.toString('hex')}`);

  const web3 = new Web3(Web3.givenProvider || `https://${chain}.infura.io/v3/${infuraToken}`);

  web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`, function(err, hash) {
    if (err) {
      console.error(err.message);
      return;
    }

    console.log('Transaction hash:');
    console.log(hash);
  });
}

getTxParams({to, nonce, gasPrice}).then((tx) => {
  return signAndBroadcast(tx)
}).catch(console.error);