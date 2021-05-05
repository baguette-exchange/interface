# Baguette Interface

An open source interface for Baguette -- a community-backed decentralized exchange for Avalanche assets, but with the
perfect smell of freshly baked bread.

## Project Introduction

Baguette is a Uniswap based AMM running on Avalanche with BAG rewards for a few selected LPs and single-token staking
pools for those who want to avoid being exposed to impermanent loss. No one can deny most DEX/AMM projects are subject
to high inflation. The goal of Baguette with $BAG is to reward users while keeping inflation under control and avoid
sharp depreciation of the token price.

## BAG Token

- Issue Time : 2021/05/01
- Total Supply : 250,000,000
- Circulating Supply : 13,600,000

## Links

- Website: [baguette.exchange](https://baguette.exchange/)
- Token Contract : [Avalanche Explorer](https://cchain.explorer.avax.network/address/0xa1144a6A1304bd9cbb16c800F7a867508726566E/transactions)
- Lite Paper: [litepaper](https://baguette.exchange/litepaper.html)
- Interface: [app.baguette.exchange](https://app.baguette.exchange)
- Analytics: [info.baguette.exchange](https://info.baguette.exchange)
- Telegram: [Baguette](https://t.me/baguette_AVAX)
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
