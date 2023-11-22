import React, { useMemo, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO, useStakingInfo, StakingType } from '../../state/stake/hooks'
import { TYPE } from '../../theme'
import PoolCard from '../../components/mill/PoolCard'
import { RowBetween, AutoRow } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/mill/styled'
import Loader from '../../components/Loader'
import Toggle from '../../components/Toggle'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@baguette-exchange/sdk'


const PageWrapper = styled(AutoColumn)`
   max-width: 640px;
   width: 100%;
 `

const TopSection = styled(AutoColumn)`
   max-width: 720px;
   width: 100%;
 `

const PoolSection = styled.div`
   display: grid;
   grid-template-columns: 1fr;
   column-gap: 10px;
   row-gap: 15px;
   width: 100%;
   justify-self: center;
 `

export default function Mill() {
  const { chainId } = useActiveWeb3React()
  const stakingInfos = useStakingInfo(StakingType.PAIR)
  const [stakingInfoResults, setStakingInfoResults] = useState<any[]>()
  const [showInactive, setShowInactive] = useState<boolean>(false)

  useMemo(() => {
    Promise.all(
      stakingInfos
        ?.sort(function(info_a, info_b) {
          // greater stake in avax comes first
          return info_a.totalStakedInWavax?.greaterThan(info_b.totalStakedInWavax ?? JSBI.BigInt(0)) ? -1 : 1
        })
        .sort(function(info_a, info_b) {
          if (info_a.stakedAmount.greaterThan(JSBI.BigInt(0))) {
            if (info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
              // both are being staked, so we keep the previous sorting
              return 0
            // the second is actually not at stake, so we should bring the first up
            else return -1
          } else {
            if (info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
              // first is not being staked, but second is, so we should bring the first down
              return 1
            // none are being staked, let's keep the  previous sorting
            else return 0
          }
        })
      /*
        .map(stakingInfo => {
          return fetch(`https://api.baguette.exchange/baguette/apr/${stakingInfo.stakingRewardAddress.toLowerCase()}`)
            .then(res => res.text())
            .then(res => ({ apr: res, ...stakingInfo }))
        })
      */
    ).then(results => {
      setStakingInfoResults(results)
    })
  }, [stakingInfos?.length])

  const DataRow = styled(RowBetween)`
     ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
   `};
   `

  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Welcome to the flour mill. Lock LP tokens to bake new fresh Baguettes</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Deposit your BGL tokens to receive BAG.
                 </TYPE.white>
              </RowBetween>{' '}
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Participating pools</TYPE.mediumHeader>
          <TYPE.black fontWeight={400}>
            Baguette batch #27 ends on December 31st
          </TYPE.black>
        </DataRow>
        <AutoRow justify="flex-end">
          <TYPE.black fontWeight={400} padding="12px">Show inactive pools</TYPE.black>
          <Toggle
            id="toggle-show-inactive"
            isActive={showInactive}
            toggle={() => { setShowInactive(!showInactive) }}
          />
        </AutoRow>

        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist ? (
            'No active rewards'
          ) : (
            stakingInfoResults?.map(stakingInfo => (
              (showInactive || stakingInfo.totalRewardRate.greaterThan(0)) && (
                <PoolCard
                  apr={'0'}
                  key={stakingInfo.stakingRewardAddress}
                  stakingInfo={stakingInfo}
                />
              )
            ))
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
