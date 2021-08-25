import React, { useState, useCallback, useContext } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled, { ThemeContext } from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import ProgressCircles from '../ProgressSteps'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { JSBI, TokenAmount, Pair, ChainId } from '@baguette-exchange/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { usePairContract, useStakingContract, useTokenContract, useAutocompoundContract } from '../../hooks/useContract'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { splitSignature } from 'ethers/lib/utils'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import { UNDEFINED, ZERO_ADDRESS, NO_EIP712_SUPPORT } from '../../constants'
import { BigNumber } from '@ethersproject/bignumber'
import Toggle from '../Toggle'
import QuestionHelper from '../QuestionHelper'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
   display: flex;
   justify-content: space-between;
   padding-right: 20px;
   padding-left: 20px;
   opacity: ${({ dim }) => (dim ? 0.5 : 1)};
 `

const ContentWrapper = styled(AutoColumn)`
   width: 100%;
   padding: 1rem;
 `

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const [ autocompound, setAutocompound ] = useState<boolean>(stakingInfo.useAutocompounding)
  const showAutocompound = (stakingInfo.autocompoundingAddress !== ZERO_ADDRESS)

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.stakedAmount.token, userLiquidityUnstaked)
  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
      stakingInfo.stakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalRewardRate
    )
  }

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])


  const dummyPair = stakingInfo.tokens[1].equals(UNDEFINED[chainId ? chainId : ChainId.AVALANCHE]) ?
    undefined :
    new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'),
      chainId ? chainId : ChainId.AVALANCHE
    )

  // pair contract for this token to be staked
  const pairContract = usePairContract(dummyPair ? dummyPair.liquidityToken.address : undefined)
  const stakingTokenContract = useTokenContract(stakingInfo.tokens[0].address)
  const tokenContract = dummyPair ? pairContract : stakingTokenContract
  const stakingToken = dummyPair ? dummyPair.liquidityToken : stakingInfo.tokens[0]

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo.stakingRewardAddress)
  const [autocompoundApproval, autocompoundApproveCallback] = useApproveCallback(parsedAmount, stakingInfo.autocompoundingAddress)

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  const autocompoundContract = useAutocompoundContract(stakingInfo.autocompoundingAddress)
  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if ((autocompound && (autocompoundApproval === ApprovalState.APPROVED)) ||
          (!autocompound && (approval === ApprovalState.APPROVED))) {
        const stakeFunction = autocompound && autocompoundContract
            ? autocompoundContract.deposit
            : stakingContract.stake
        await stakeFunction(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
      } else if (signatureData) {
        const stakeWithPermitFunction = autocompound && autocompoundContract
            ? autocompoundContract.depositWithPermit
            : stakingContract.stakeWithPermit
        stakeWithPermitFunction(
          `0x${parsedAmount.raw.toString(16)}`,
          signatureData.deadline,
          signatureData.v,
          signatureData.r,
          signatureData.s,
          { gasLimit: 350000 }
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit liquidity`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!tokenContract || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    let nonce: BigNumber | undefined = undefined

    if (NO_EIP712_SUPPORT.includes(stakingToken)) {
      autocompound ? autocompoundApproveCallback() : approveCallback()
    } else {
      // try to gather a signature for permission
      try {
        nonce = await tokenContract.nonces(account)
      } catch (error) {
        // If 'permit' is not supported by the contract, proceed the manual way
        autocompound ? autocompoundApproveCallback() : approveCallback()
      }
    }

    if (nonce) {
      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ]

      const domain = {
        name: dummyPair ? 'Baguette Liquidity' : stakingToken.name,
        version: '1',
        chainId: chainId,
        verifyingContract: tokenContract.address
      }

      const Permit = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]

      const spenderContractAddress = autocompound && autocompoundContract
          ? stakingInfo.autocompoundingAddress
          : stakingInfo.stakingRewardAddress

      const message = {
        owner: account,
        spender: spenderContractAddress,
        value: liquidityAmount.raw.toString(),
        nonce: nonce.toHexString(),
        deadline: deadline.toNumber()
      }
      const data = JSON.stringify({
        types: {
          EIP712Domain,
          Permit
        },
        domain,
        primaryType: 'Permit',
        message
      })

      library
        .send('eth_signTypedData_v4', [account, data])
        .then(splitSignature)
        .then(signature => {
          console.log("signature: ", signature)
          setSignatureData({
            v: signature.v,
            r: signature.r,
            s: signature.s,
            deadline: deadline.toNumber()
          })
        })
        .catch(error => {
          // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
          if (error?.code !== 4001) {
            autocompound ? autocompoundApproveCallback() : approveCallback()
          }
        })
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.token}
            pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'Available to deposit: '}
            id="stake-liquidity-token"
          />

          <HypotheticalRewardRate dim={!hypotheticalRewardRate.greaterThan('0')}>
            <div>
              <TYPE.black fontWeight={600}>Weekly Rewards</TYPE.black>
            </div>

            <TYPE.black>
              {hypotheticalRewardRate.multiply((60 * 60 * 24 * 7).toString()).toSignificant(4, { groupSeparator: ',' })}{' '}
               BAG / week
             </TYPE.black>
          </HypotheticalRewardRate>

          {showAutocompound && (
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Autocompound with Yield Yak
                </TYPE.black>
                <QuestionHelper text="Stake with autocompounding using yieldyak.com. If you are already staking tokens in one mode, you need to withdraw first in order to stake in the other mode"
                />
              </RowFixed>
              <Toggle
                id="toggle-autocompound-yieldyak"
                isActive={autocompound}
                toggle={
                  autocompound
                    ? () => {
                        setAutocompound(stakingInfo.useAutocompounding)
                      }
                    : () => {
                        setAutocompound(
                          !stakingInfo.useAutocompounding
                          && !JSBI.greaterThan(stakingInfo.stakedAmount.raw, JSBI.BigInt(0))
                        )
                      }
                }
              />
            </RowBetween>
          )}

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={(autocompound
                  ? (autocompoundApproval === ApprovalState.APPROVED)
                  : (approval === ApprovalState.APPROVED))
                || signatureData !== null}
              disabled={(autocompound
                  ? (autocompoundApproval !== ApprovalState.NOT_APPROVED)
                  : (approval !== ApprovalState.NOT_APPROVED))
                || signatureData !== null}
            >
              Approve
             </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (signatureData === null && (autocompound
                ? (autocompoundApproval !== ApprovalState.APPROVED)
                : (approval !== ApprovalState.APPROVED)))}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[(autocompound
              ? (autocompoundApproval === ApprovalState.APPROVED)
              : (approval === ApprovalState.APPROVED))
            || signatureData !== null]} disabled={true} />
        </ContentWrapper >
      )
      }
      {
        attempting && !hash && (
          <LoadingView onDismiss={wrappedOnDismiss}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>{dummyPair ? 'Depositing Liquidity' : 'Staking Tokens'}</TYPE.largeHeader>
              <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} {dummyPair ? 'BGL' : stakingToken.symbol}</TYPE.body>
            </AutoColumn>
          </LoadingView>
        )
      }
      {
        attempting && hash && (
          <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
              <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} {dummyPair ? 'BGL' : stakingToken.symbol}</TYPE.body>
            </AutoColumn>
          </SubmittedView>
        )
      }
    </Modal >
  )
}
