# Baguette Interface

An open source interface for Baguette -- a community-backed decentralized exchange for Avalanche assets, but with the
perfect smell of freshly baked bread.

- Website: [baguette.exchange](https://baguette.exchange/)
- Interface: [app.baguette.exchange](https://app.baguette.exchange)
- Telegram: [Baguette](https://t.me/joinchat/0mG2uoUvv7xjZjI0)
- Twitter: [@Baguette_avax](https://twitter.com/Baguette_avax)


## Accessing the Baguette Interface

Visit [app.baguette.exchange](https://app.baguette.exchange).

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to your JSON-RPC provider

Note that the interface only works on testnets where both
[Baguette](https://github.com/baguette-exchange/contracts) and
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Attribution
This code was adapted from this Uniswap repo: [uniswap-interface](https://github.com/Uniswap/uniswap-interface).
