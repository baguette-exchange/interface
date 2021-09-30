import { ChainId, JSBI, Percent, Token, WAVAX } from '@baguette-exchange/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected } from '../connectors'

export const GAS_PRICE = 225;

export const LANDING_PAGE = 'https://baguette.exchange/'
export const ANALYTICS_PAGE = 'https://info.baguette.exchange/'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xC386631E7D35c7231bE146b14cf4430b4A524F8A',
  [ChainId.AVALANCHE]: '0xF7b1e993d1b4F7348D64Aa55A294E4B74512F7f2'
}

export const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xBB6e8C136ca537874a6808dBFC5DaebEd9a57554',
  [ChainId.AVALANCHE]: '0x3587B8c0136c2C3605a9E5B03ab54Da3e4044b50'
}

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const BAG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x5eb9f3D24fe25C582fCec2a32aEb774Ea8D47ae8', 18, 'BAG', 'Baguette'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xa1144a6A1304bd9cbb16c800F7a867508726566E', 18, 'BAG', 'Baguette')
}

export const PNG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'PNG', 'Pangolin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin')
}

export const ETH: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x89B2eC9b2fB0CDdd09954dbEE07DB48F8cc934e3', 18, 'ETH', 'Ether'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15', 18, 'ETH', 'Ether')
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xde3A24028580884448a5397872046a019649b084', 6, 'USDT', 'Tether USD')
}

export const WBTC: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 8, 'WBTC', 'Wrapped Bitcoin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB', 8, 'WBTC', 'Wrapped Bitcoin')
}

export const LINK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651', 18, 'LINK', 'ChainLink Token')
}

export const DAI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a', 18, 'DAI', 'Dai Stablecoin')
}

export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xf39f9671906d8630812f9d9863bBEf5D523c84Ab', 18, 'UNI', 'Uniswap')
}

export const SUSHI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'SUSHI', 'SushiToken'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc', 18, 'SUSHI', 'SushiToken')
}

export const AAVE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'AAVE', 'Aave Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9', 18, 'AAVE', 'Aave Token')
}

export const YFI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YFI', 'yearn.finance'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x99519AcB025a0e0d44c3875A4BbF03af65933627', 18, 'YFI', 'yearn.finance')
}

export const XAVA: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XAVA', 'Avalaunch'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4', 18, 'XAVA', 'Avalaunch')
}

export const SHIBX: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'SHIBX', 'SHIBAVAX'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x440abbf18c54b2782a4917b80a1746d3a2c2cce1', 18, 'SHIBX', 'SHIBAVAX')
}

export const LYD: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'LYD', 'LydiaFinance'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x4C9B4E1AC6F24CdE3660D5E4Ef1eBF77C710C084', 18, 'LYD', 'LydiaFinance')
}

export const QI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'QI', 'BENQI'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5', 18, 'QI', 'BENQI')
}

export const USDTE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT.e', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xc7198437980c041c805a1edcba50c1ce5db95118', 6, 'USDTE', 'Tether USD')
}

export const LINKE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'LINK.e', 'Chainlink Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x5947bb275c521040051d82396192181b413227a3', 18, 'LINK.e', 'Chainlink Token')
}

export const WETHE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'WETH.e', 'Wrapped Ether'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', 18, 'WETH.e', 'Wrapped Ether')
}

export const WET: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'WET', 'Weble Ecosystem Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xb1466d4cf0dcfc0bcddcf3500f473cdacb88b56d', 18, 'WET', 'Weble Ecosystem Token')
}

export const YAK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YAK', 'Yak Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x59414b3089ce2af0010e7523dea7e2b35d776ec7', 18, 'YAK', 'Yak Token')
}

export const KLO: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'KLO', 'Kalao Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xb27c8941a7df8958a1778c0259f76d1f8b711c35', 18, 'KLO', 'Kalao Token')
}

export const XSLR: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XSLR', 'NovaXSolarEnergy'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xe6ee049183b474ecf7704da3f6f555a1dcaf240f', 18, 'XSLR', 'NovaXSolarEnergy')
}

export const XMTL: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XMTL', 'NovaXMetal'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x4c1057455747e3ee5871d374fdd77a304ce10989', 18, 'XMTL', 'NovaXMetal')
}

export const XCRS: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XCRS', 'NovaXCrystal'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x70b4ae8eb7bd572fc0eb244cd8021066b3ce7ee4', 18, 'XCRS', 'NovaXCrystal')
}

export const USDCE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', 6, 'USDC.e', 'USD Coin')
}

export const UNDEFINED: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 0),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, ZERO_ADDRESS, 0)
}

export const AIRDROP_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: ZERO_ADDRESS,
  [ChainId.AVALANCHE]: ZERO_ADDRESS
}

const WAVAX_ONLY: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI], BAG[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [
    WAVAX[ChainId.AVALANCHE],
    BAG[ChainId.AVALANCHE],
    USDTE[ChainId.AVALANCHE],
  ]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.AVALANCHE]: {

  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.AVALANCHE]: [
  ]
}

// token contracts that should not be used with EIP712
export const NO_EIP712_SUPPORT = [
  QI[ChainId.AVALANCHE]
]

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 60

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
