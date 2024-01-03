# Akashian Bridge

This bridge allows the exchange of ERC20 tokens and Akash tokens.

## Contract Addressess

Ensure you are doing business with Akash Network

### Ethereum Ropsten (TestNet) Network

| Currency | Contract Address                           |
| -------- | ------------------------------------------ |
| wAKT     | 0xA7a8E7102F4f9C533Cd6F0326704BEcdb0e859C9 |

## Wrap Akash

To Wrap Akash, send a transaction with the Destination Chain Address in the memo field. Please be sure to fill the memo field out, or the transaction will not complete.

```bash
$ akash tx send \
    "$(AKASH_WALLET_ADDRESS)" \
    "akash1f5qeq9uj9c9nnx5vma8fsu7keqq6csjt5xvwe6" \
    "5000uakt" \
    --memo=${DESTINATION_ADDRESS}
```

## Contributing

Requires

- Node 16
- Redis
- .env (backed up ones in keybase)
- akash CLI

### Breakdown

There are multiple long running processes in the `src/server/` folder.
