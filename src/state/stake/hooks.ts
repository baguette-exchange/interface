import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX, Pair } from '@baguette-exchange/sdk'
import { useMemo } from 'react'
import { BAG, LINK, DAI, ETH, WBTC, USDT, UNDEFINED } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
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
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.FUJI]: [
    {
      tokens: [BAG[ChainId.FUJI], WAVAX[ChainId.FUJI]],
      stakingRewardAddress: '0xb7aB7Cd938D9409c2312c43c807B1C6FA7393777'
    },
    {
      tokens: [BAG[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      stakingRewardAddress: '0x2d6CA9Ec52B45a029bB97503eA1582cb91bFB55E'
    },
    {
      tokens: [WAVAX[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      stakingRewardAddress: '0x1744CEeB870793E26a21e34b367F4161b076B6bf'
    }
  ],
  [ChainId.AVALANCHE]: [
    // Oven
    {
      tokens: [BAG[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x2bCE0CAB94770D0F2Eae3E8a582ADC3EaA0BD81f'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x706c57a2755956e3978f6b4986513E78d0A06520'
    },
    // Mill
    {
      tokens: [BAG[ChainId.AVALANCHE], WAVAX[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x266CB810A383b70bfeCa7285E0464746690e849b'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x6268c39511825d9a3FD4e7De75e8a4c784DCa02B'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x7b68d44FcDeF34a57f5c95C4a46c8a2e72fAe4e2'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x1c596eaA585263519AdC39d3896b6AE35C5830f6'
    },
    {
      tokens: [BAG[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
      stakingRewardAddress: '0xEB5069AE76f3F07bfEBB4497c85EFA9740520847'
    },
    {
      tokens: [WBTC[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x507B2f7435E8fF982a17CeD0988832e632c60E7e'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x6cBB1696D45E066b4Ca79C58690d5b5146BE94c5'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
      stakingRewardAddress: '0xDB12cd73c8b547511E0171eA76223Df227D27CEb'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x30393161E53B56E51A4f4c72d3C6Ae6907F44a2F'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
      stakingRewardAddress: '0x03800269e547F683A2F34c7426782EeF7E1E5440'
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
      stakingRewardAddress: '0xF125771F27b5a639C08e3086872085f8270C3FfB'
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
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  //  total staked Avax in the pool
  totalStakedInWavax: TokenAmount
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
  totalSupply: JSBI,
  avaxTokenPairReserveOfAvax: JSBI,
  avaxTokenPairReserveOfToken: JSBI,
  stakingTokenPairReserveOfToken: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount
{
  if (JSBI.equal(totalSupply, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxTokenRatio = JSBI.divide(JSBI.multiply(oneToken, avaxTokenPairReserveOfAvax), avaxTokenPairReserveOfToken)
  const valueOfTokenInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfToken, avaxTokenRatio), oneToken)

  return new TokenAmount(WAVAX[chainId], JSBI.divide(
      JSBI.multiply(totalStakedAmount.raw, valueOfTokenInAvax),
      totalSupply
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

  const bag = BAG[chainId ? chainId : ChainId.AVALANCHE]
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({tokens}) => tokens), [info])
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
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
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

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
        if (isPair && pair) {
          const wavax = tokens[0].equals(WAVAX[tokens[0].chainId]) ? tokens[0] : tokens[1]
          const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId)
          totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, totalSupply)
          stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]))
          const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId])
          console.log(WAVAX[tokens[1].chainId])
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
        } else {
          const isTokenAvax = tokens[0].equals(WAVAX[tokens[0].chainId])

          if (!isTokenAvax && (avaxTokenPairState === PairState.INVALID || avaxTokenPairState === PairState.NOT_EXISTS)) {
            console.error('Invalid pair requested')
            return memo
          }

          totalStakedAmount = new TokenAmount(tokens[0], totalSupply)
          stakedAmount = new TokenAmount(tokens[0], JSBI.BigInt(balanceState?.result?.[0] ?? 0))
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]))
          totalStakedInWavax = isTokenAvax ? totalStakedAmount :
            avaxTokenPair ?
              calculateTotalStakedAmountInAvaxFromToken(
                chainId,
                totalSupply,
                avaxTokenPair.reserveOf(WAVAX[tokens[0].chainId]).raw,
                avaxTokenPair.reserveOf(tokens[0]).raw,
                stakedAmount.raw,
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
          tokens: tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(bag, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
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
  }, [balances, chainId, earnedAmounts, info, periodFinishes, rewardRates, rewardsAddresses, totalSupplies, avaxBagPairState, pairs, bag, avaxBagPair, avaxPairs, stakingType])
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
