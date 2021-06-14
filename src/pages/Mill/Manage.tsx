import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI } from '@baguette-exchange/sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/mill/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
import StakingModal from '../../components/mill/StakingModal'
import { useStakingInfo, StakingType } from '../../state/stake/hooks'
import UnstakingModal from '../../components/mill/UnstakingModal'
import ClaimRewardModal from '../../components/mill/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'
import YieldYakLogoBlack from '../../assets/images/yieldyak-logo-black.png'
import YieldYakLogoGrey from '../../assets/images/yieldyak-logo-grey.png'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { currencyId } from '../../utils/currencyId'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
import { BIG_INT_ZERO } from '../../constants'

const PageWrapper = styled(AutoColumn)`
   max-width: 640px;
   width: 100%;
 `

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
   position: relative;
   max-width: 640px;
   width: 100%;
   opacity: ${({ dim }) => (dim ? 0.6 : 1)};
 `

const BottomSection = styled(AutoColumn)`
   border-radius: 12px;
   width: 100%;
   position: relative;
 `

const StyledDataCard = styled(DataCard) <{ bgColor?: any; showBackground?: any }>`
   background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
   z-index: 2;
   box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
   background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
 `

const StyledBottomCard = styled(DataCard) <{ dim: any }>`
   background: ${({ theme }) => theme.bg3};
   opacity: ${({ dim }) => (dim ? 0.4 : 1)};
   margin-top: -40px;
   padding: 0 1.25rem 1rem 1.25rem;
   padding-top: 32px;
   z-index: 1;
 `

const PoolData = styled(DataCard)`
   background: none;
   border: 1px solid ${({ theme }) => theme.bg4};
   padding: 1rem;
   z-index: 1;
 `

const VoteCard = styled(DataCard)`
   background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
   overflow: hidden;
 `

const DataRow = styled(RowBetween)`
   justify-content: center;
   gap: 12px;
   ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
     gap: 12px;
   `};
 `

const StyledLogo = styled.img`
  display: flex;
  margin-top: -4px;
  margin-left: 4px;
  width: 52px;
`

export function ManagePair({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingInfo(StakingType.PAIR, stakingTokenPair)?.[0]
  const valueOfTotalStakedAmountInWavax = stakingInfo?.totalStakedInWavax

  // get the color of the second token of the pair
  const backgroundColor = useColor(tokenB)

  const darkMode = useIsDarkMode()
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))
  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'
  const toggleWalletModal = useWalletModalToggle()
  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {currencyA?.symbol}-{currencyB?.symbol} Liquidity Mining
         </TYPE.mediumHeader>
        <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={24} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total Staked</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {`${valueOfTotalStakedAmountInWavax?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.totalRewardRate
                ?.multiply((60 * 60 * 24 * 7).toString())
                ?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
              {' BAG / week'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get Baguette Liquidity tokens (BGL)</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`BGL tokens are required. Once you've added liquidity to the ${currencyA?.symbol}-${currencyB?.symbol} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`}
              >
                {`Add ${currencyA?.symbol}-${currencyB?.symbol} liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your liquidity deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <TYPE.white>
                    BGL {currencyA?.symbol}-{currencyB?.symbol}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <CardBGImage desaturate />
            <CardNoise />
            <AutoColumn gap="sm">
              {!stakingInfo?.useAutocompounding && (
                <RowBetween>
                  <div>
                    <TYPE.black>Your unclaimed BAG</TYPE.black>
                  </div>
                  {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowClaimRewardModal(true)}
                    >
                      Claim
                    </ButtonEmpty>
                  )}
                </RowBetween>
              )}
              <RowBetween style={{ alignItems: 'baseline' }}>
                {!stakingInfo?.useAutocompounding && (
                  <TYPE.largeHeader fontSize={36} fontWeight={600}>
                    <CountUp
                      key={countUpAmount}
                      isCounting
                      decimalPlaces={4}
                      start={parseFloat(countUpAmountPrevious)}
                      end={parseFloat(countUpAmount)}
                      thousandsSeparator={','}
                      duration={1}
                    />
                  </TYPE.largeHeader>
                )}
                {stakingInfo?.useAutocompounding && (
                  <RowFixed>
                    <TYPE.largeHeader fontSize={16} fontWeight={500}>
                      Autocompounding with
                    </TYPE.largeHeader>
                    <StyledLogo src={darkMode ? YieldYakLogoGrey : YieldYakLogoBlack} alt="Yield Yak Logo" />
                  </RowFixed>
                )}
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                   </span>
                  {stakingInfo?.rewardRate
                    ?.multiply((60 * 60 * 24 * 7).toString())
                    ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                  {' BAG / week'}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        {!stakingInfo?.useAutocompounding && (
          <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              ⭐️
            </span>
            When you withdraw, the contract will automagically claim BAG on your behalf!
          </TYPE.main>
        )}
        {stakingInfo?.useAutocompounding && (
          <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              ⭐️
            </span>
            Autocompounding automagically converts BAG rewards in BGL tokens. Wait and see your
            deposited BGL amount increase over time! When you withdraw, you receive the last updated
            amount of BGL tokens.
          </TYPE.main>
        )}
        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit BGL Tokens'}
            </ButtonPrimary>

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Withdraw
                 </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} BGL tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
