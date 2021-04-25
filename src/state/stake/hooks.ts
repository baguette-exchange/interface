import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX, Pair } from '@baguette-exchange/sdk'
import { useMemo } from 'react'
import { BAG, UNDEFINED } from '../../constants'
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
  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxBagRatio = JSBI.divide(JSBI.multiply(oneToken, avaxBagPairReserveOfOtherToken), avaxBagPairReserveOfBag)
  const valueOfBagInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfBag, avaxBagRatio), oneToken)

  if (JSBI.equal(totalSupply, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

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
          console.error('Failed to load staking rewards info')
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
