import React from 'react'
import styled from 'styled-components'
import PoweredByAvax from '../../assets/images/powered-by-avax.png'

const StyledLogo = styled.img`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  width: 15%
`

export default function PoweredByAVAX() {
  return (
    <StyledLogo src={PoweredByAvax} alt="Powered by AVAX" />
  )
}
