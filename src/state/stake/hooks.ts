import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX, Pair } from '@baguette-exchange/sdk'
import { useMemo } from 'react'
import { BAG, LINK, DAI, ETH, WBTC, USDT, XAVA, SHIBX, LYD, QI, LINKE, USDTE, WETHE, YAK, WET, UNDEFINED, ZERO_ADDRESS } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { AUTOCOMPOUND_INTERFACE } from '../../constants/abis/autocompound'
import { PairState, usePair, usePairs } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'

export const STAKING_GENESIS = 1600387200

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    rewardToken: Token
    stakingRewardAddress: string
    autocompoundingAddress: string
  }[]
} = {
  [ChainId.FUJI]: [
    {
      tokens: [BAG[ChainId.FUJI], WAVAX[ChainId.FUJI]],
      rewardToken: BAG[ChainId.FUJI],
      stakingRewardAddress: '0xb7aB7Cd938D9409c2312c43c807B1C6FA7393777',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [BAG[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      rewardToken: BAG[ChainId.FUJI],
      stakingRewardAddress: '0x2d6CA9Ec52B45a029bB97503eA1582cb91bFB55E',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [WAVAX[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      rewardToken: BAG[ChainId.FUJI],
      stakingRewardAddress: '0x1744CEeB870793E26a21e34b367F4161b076B6bf',
      autocompoundingAddress: ZERO_ADDRESS
    }
  ],
  [ChainId.AVALANCHE]: [
    // Oven
    {
      tokens: [BAG[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x2bCE0CAB94770D0F2Eae3E8a582ADC3EaA0BD81f',
      autocompoundingAddress: '0xf487044eD85F2d47A8eAD6b86c834976B8c31736'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x706c57a2755956e3978f6b4986513E78d0A06520',
      autocompoundingAddress: '0x58887009A412Ad52a4FB746D0846585346d83BC0'
    },
    {
      tokens: [XAVA[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xfc6B409109e84B681786660405cff09C43FE9b4E',
      autocompoundingAddress: '0x562ACEA3c03dBDDc25e2F24bb2685D17Bdb4e62f'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      rewardToken: LYD[ChainId.AVALANCHE],
      stakingRewardAddress: '0x5053494D1EFA7514C1D72CCA8D8Dca40d8119fCc',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [QI[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xcf09570845adc0df5dcfa5b93882b115ed0da89c',
      autocompoundingAddress: ZERO_ADDRESS
    },
    // Mill
    {
      tokens: [BAG[ChainId.AVALANCHE], WAVAX[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x266CB810A383b70bfeCa7285E0464746690e849b',
      autocompoundingAddress: '0x908698B561eA14f153dDD1Ee02f99EBE0A4cea0f'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x6268c39511825d9a3FD4e7De75e8a4c784DCa02B',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x3963b5b570f9Eae630d645c109D3BDEC299CBBEe',
      autocompoundingAddress: '0xb667121B4D4b6ea5DE4bb61bd3a02E53529BfcCA'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x7b68d44FcDeF34a57f5c95C4a46c8a2e72fAe4e2',
      autocompoundingAddress: '0xBD9f16EeE869808bF22823427D1f4a1E7A440E8D'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1c596eaA585263519AdC39d3896b6AE35C5830f6',
      autocompoundingAddress: '0x90E24A2dfd80F02D01c7B630E8e3199C8A0388D3'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xEB5069AE76f3F07bfEBB4497c85EFA9740520847',
      autocompoundingAddress: '0x165FA1023429E266Cd767845E8dE419Ce3abd379'
    },
    {
      tokens: [WBTC[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x507B2f7435E8fF982a17CeD0988832e632c60E7e',
      autocompoundingAddress: '0x8F871D05d7AfB9dAffA5Df13A91c74e870e6c31E'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x6cBB1696D45E066b4Ca79C58690d5b5146BE94c5',
      autocompoundingAddress: '0xfb5Aa7660fDe5013996FD72a193ACCF00212Af32'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xDB12cd73c8b547511E0171eA76223Df227D27CEb',
      autocompoundingAddress: '0xFD1F86448b56942C32B954092F2fDBCE91E37Bf6'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x30393161E53B56E51A4f4c72d3C6Ae6907F44a2F',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xF74c010CB319FdA048006742aE2BDccA71bEcCba',
      autocompoundingAddress: '0x39F7fCB3aF11B0a274514C581d468739e75f64EC'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x03800269e547F683A2F34c7426782EeF7E1E5440',
      autocompoundingAddress: '0x8C3C86bEA8eD5ACbCE4944deF6731291Eb193C26'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xF125771F27b5a639C08e3086872085f8270C3FfB',
      autocompoundingAddress: '0xFC47515433eE291E692958a2D15F99896FAFC0BC'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], SHIBX[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xE958DCc86632D7421A86133026423a232Ea2212E',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], SHIBX[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1D96eb4BDe096eF3A73583E02b3FfA4c2BB97933',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], WETHE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x8fab6f3c7fbca7b9aacb56bb4f17bc73c31e3f50',
      autocompoundingAddress: '0x142b4e2c9234afc3dc07e12d24493a4ef26c537c'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], LINKE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x3c8201d13a6c573518574bf9bbd763318664eafa',
      autocompoundingAddress: '0x3ca2cfd8e17c40ac6f4aa6c1a4b1723f0bf59dd8'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], USDTE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x81a6fedcf8bd3de346b3d368904f536ffa13fdf0',
      autocompoundingAddress: '0xb940da8b71791c1f42cc612d1af427878ec1a369'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], YAK[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x4aafe44a0cdec72be791271013cee8af3f8c5753',
      autocompoundingAddress: '0x1b53500677cb1b042b12081a8661a6f08781d58c'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], QI[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x8bcacf09adf3d9404ef34c3324eeec525adb5a65',
      autocompoundingAddress: '0x9ee89f3a3dfd596bb6f53696e2ed1d09c738f8c8'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], WET[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x12bca09acbee692fdd8473e68cf0ecd83570b111',
      autocompoundingAddress: '0x211654525dc64a7f74f6361d6f3dc0710108ae43'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDTE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xb00d89c3f65cef0742f9d0cc59c9ad90a01b8faf',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], LINKE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x3a2d34b6ca91c33a8042ddb00b5f68d2e2834267',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], WETHE[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x9c8cdcc785dba292f8bccff533c5622e06f0b76c',
      autocompoundingAddress: ZERO_ADDRESS
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], YAK[ChainId.AVALANCHE]],
      rewardToken: BAG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xe1974858008ba95dc515fe72650bfa81125718bc',
      autocompoundingAddress: ZERO_ADDRESS
    }
  ]
}

export enum StakingType {
  PAIR,
  SINGLE,
  BOTH
}

export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the address of the autocompounding contract
  autocompoundingAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the token in which rewards are distributed
  rewardToken: Token
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the amount of shares of the autocompounding pool if applicable
  sharesAmount: JSBI
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  // total staked Avax in the pool
  totalStakedInWavax: TokenAmount
  // use autocompounding
  useAutocompounding: boolean
  // when the period ends
  periodFinish: Date | undefined
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

const calculateTotalStakedAmountInAvaxFromBag = function(
  chainId: ChainId,
  totalSupply: JSBI,
  avaxBagPairReserveOfBag: JSBI,
  avaxBagPairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfBag: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount
{
  if (JSBI.equal(totalSupply, JSBI.BigInt(0)) || JSBI.equal(avaxBagPairReserveOfBag, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxBagRatio = JSBI.divide(JSBI.multiply(oneToken, avaxBagPairReserveOfOtherToken), avaxBagPairReserveOfBag)
  const valueOfBagInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfBag, avaxBagRatio), oneToken)

  return new TokenAmount(WAVAX[chainId], JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfBagInAvax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}

const calculateTotalStakedAmountInAvax = function(
  chainId: ChainId,
  totalSupply: JSBI,
  reserveInWavax: JSBI,
  totalStakedAmount: TokenAmount
): TokenAmount
{
  if (JSBI.equal(totalSupply, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

  // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
  return new TokenAmount(WAVAX[chainId], JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, reserveInWavax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}

const calculateTotalStakedAmountInAvaxFromToken = function(
  chainId: ChainId,
  avaxTokenPairReserveOfAvax: JSBI,
  avaxTokenPairReserveOfToken: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount
{
  if (JSBI.equal(avaxTokenPairReserveOfToken, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxTokenRatio = JSBI.divide(JSBI.multiply(oneToken, avaxTokenPairReserveOfAvax), avaxTokenPairReserveOfToken)

  return new TokenAmount(WAVAX[chainId], JSBI.divide(
      JSBI.multiply(totalStakedAmount.raw, avaxTokenRatio),
      oneToken
    )
  )
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(stakingType: StakingType, pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
        ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const oneToken = JSBI.BigInt(1000000000000000000)
  const bag = BAG[chainId ? chainId : ChainId.AVALANCHE]
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const autocompoundingAddresses = useMemo(() => info.map(({ autocompoundingAddress }) => autocompoundingAddress), [info])
  const rewardTokens = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({tokens}) => tokens), [info])
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const autocompounderShares = useMultipleContractSingleData(
      autocompoundingAddresses,
      AUTOCOMPOUND_INTERFACE,
      'balanceOf',
      accountArg)
  const autocompounderShareTokenRatios = useMultipleContractSingleData(
      autocompoundingAddresses,
      AUTOCOMPOUND_INTERFACE,
      'getDepositTokensForShares',
      ['1000000000000000000'])
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')

  const pairs = usePairs(tokens)
  const avaxPairs = usePairs(tokens.map(pair => [WAVAX[chainId ? chainId : ChainId.AVALANCHE], pair[0]]))
  const [avaxBagPairState, avaxBagPair] = usePair(WAVAX[chainId ? chainId : ChainId.AVALANCHE], bag)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !bag) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      const autocompoundingAddress = autocompoundingAddresses[index]
      const rewardToken = rewardTokens[index]
      let useAutocompounding = false

      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const autocompounderSharesState = autocompounderShares[index]
      const autocompounderShareTokenRatioState = autocompounderShareTokenRatios[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      const tokens = info[index].tokens
      const [avaxTokenPairState, avaxTokenPair] = avaxPairs[index]
      const isPair = tokens[1] !== UNDEFINED[tokens[1].chainId]
      const [pairState, pair] = pairs[index]

      if ((isPair && stakingType === StakingType.SINGLE) ||
          (!isPair && stakingType === StakingType.PAIR)) {
        return memo
      }

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        ((isPair &&
           pair  &&
           (pairState !== PairState.LOADING)) ||
          !isPair) &&
        avaxBagPair &&
        avaxBagPairState !== PairState.LOADING
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          (isPair &&
            ((pairState === PairState.INVALID) ||
             (pairState === PairState.NOT_EXISTS))) ||
          avaxBagPairState === PairState.INVALID ||
          avaxBagPairState === PairState.NOT_EXISTS
        ) {
          return memo
        }

        const totalSupply = JSBI.BigInt(totalSupplyState.result?.[0])
        let totalStakedInWavax: TokenAmount
        let stakedAmount: TokenAmount
        let totalRewardRate: TokenAmount
        let totalStakedAmount: TokenAmount
        let sharesAmount = JSBI.BigInt(0)
        if (isPair && pair) {
          const wavax = tokens[0].equals(WAVAX[tokens[0].chainId]) ? tokens[0] : tokens[1]
          const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId)
          totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, totalSupply)

          if (balanceState
              && balanceState.result
              && balanceState.result[0] > 0) {
            stakedAmount = new TokenAmount(
              dummyPair.liquidityToken,
              JSBI.BigInt(balanceState.result[0])
            )
          } else if (autocompounderSharesState
                  && autocompounderSharesState.result
                  && autocompounderSharesState.result[0] > 0
                  && autocompounderShareTokenRatioState
                  && autocompounderShareTokenRatioState.result
                  && autocompounderShareTokenRatioState.result[0] > 0) {
            sharesAmount = JSBI.BigInt(autocompounderSharesState.result[0])
            stakedAmount = new TokenAmount(
              dummyPair.liquidityToken,
              JSBI.divide(
                JSBI.multiply(
                  JSBI.BigInt(autocompounderShareTokenRatioState.result[0]),
                  sharesAmount
                ),
                oneToken
              )
            )
            useAutocompounding = true
          } else {
            stakedAmount = new TokenAmount(
              dummyPair.liquidityToken,
              JSBI.BigInt(0)
            )
          }
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]))
          const isUSDPool =
            (tokens[0].equals(USDCE[tokens[0].chainId]) && tokens[1].equals(USDTE[tokens[1].chainId])) ||
            (tokens[0].equals(USDTE[tokens[0].chainId]) && tokens[1].equals(USDCE[tokens[1].chainId]))
          if (isUSDPool && avaxTokenPair) {
            totalStakedInWavax = calculateTotalStakedAmountInAvaxFromToken(
                chainId,
                avaxTokenPair.reserveOf(WAVAX[tokens[0].chainId]).raw,
                avaxTokenPair.reserveOf(tokens[0]).raw,
                totalStakedAmount)
          } else {
            const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId])
            totalStakedInWavax = isAvaxPool ?
              calculateTotalStakedAmountInAvax(
                chainId,
                totalSupply,
                pair.reserveOf(wavax).raw,
                totalStakedAmount) :
                calculateTotalStakedAmountInAvaxFromBag(
                  chainId,
                  totalSupply, avaxBagPair.reserveOf(bag).raw,
                  avaxBagPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
                  pair.reserveOf(bag).raw, totalStakedAmount
              )
          }
        } else {
          const isTokenAvax = tokens[0].equals(WAVAX[tokens[0].chainId])

          if (!isTokenAvax && (avaxTokenPairState === PairState.INVALID || avaxTokenPairState === PairState.NOT_EXISTS)) {
            console.error('Invalid pair requested')
            return memo
          }

          totalStakedAmount = new TokenAmount(tokens[0], totalSupply)
          if (balanceState
              && balanceState.result
              && balanceState.result[0] > 0) {
            stakedAmount = new TokenAmount(
              tokens[0],
              JSBI.BigInt(balanceState.result[0])
            )
          } else if (autocompounderSharesState
                  && autocompounderSharesState.result
                  && autocompounderSharesState.result[0] > 0
                  && autocompounderShareTokenRatioState
                  && autocompounderShareTokenRatioState.result
                  && autocompounderShareTokenRatioState.result[0] > 0) {
            sharesAmount = JSBI.BigInt(autocompounderSharesState.result[0])
            stakedAmount = new TokenAmount(
              tokens[0],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.BigInt(autocompounderShareTokenRatioState.result[0]),
                  sharesAmount
                ),
                oneToken
              )
            )
            useAutocompounding = true
          } else {
            stakedAmount = new TokenAmount(
              tokens[0],
              JSBI.BigInt(0)
            )
          }
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]))
          totalStakedInWavax = isTokenAvax ? totalStakedAmount :
            avaxTokenPair ?
              calculateTotalStakedAmountInAvaxFromToken(
                chainId,
                avaxTokenPair.reserveOf(WAVAX[tokens[0].chainId]).raw,
                avaxTokenPair.reserveOf(tokens[0]).raw,
                totalStakedAmount) :
              new TokenAmount(WAVAX[tokens[0].chainId], JSBI.BigInt(0))
        }

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            bag,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber()

        memo.push({
          stakingRewardAddress: rewardsAddress,
          autocompoundingAddress: autocompoundingAddress,
          useAutocompounding: useAutocompounding,
          tokens: tokens,
          rewardToken: rewardToken,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(bag, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          sharesAmount: sharesAmount,
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          totalStakedInWavax: totalStakedInWavax,
          getHypotheticalRewardRate
        })
      }

      return memo
    }, [])
  }, [balances, chainId, earnedAmounts, info, periodFinishes, rewardRates, rewardTokens, rewardsAddresses, autocompoundingAddresses, autocompounderShareTokenRatios, autocompounderShares, totalSupplies, avaxBagPairState, pairs, bag, avaxBagPair, avaxPairs, stakingType, oneToken])
}

export function useTotalBagEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const bag = chainId ? BAG[chainId] : undefined
  const stakingInfos = useStakingInfo(StakingType.BOTH)

  return useMemo(() => {
    if (!bag) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(bag, '0')
      ) ?? new TokenAmount(bag, '0')
    )
  }, [stakingInfos, bag])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
