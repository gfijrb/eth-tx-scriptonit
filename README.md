# Ethereum transaction script

Using private key and infura service.   
You can use this script to send new transaction or replacement of the existing transaction
if set the same "nonce" parameter.

# Configuration

Set `pk` and `infuraToken`:

configs.json

Set transaction details:

tx.json

```json
{
    "nonce": "integer", 
    "gasPrice": "integer",
    "gasLimit": "integer",
    "to": "address",
    "value": "integer",
    "data": "hex string"
}
```

# Start

To send transaction, use command below

```bash
yarn send
```
or
```bash
npm run send
```