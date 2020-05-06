/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'
import React from 'react'
import { Kui } from '@kui-shell/plugin-client-common'

// use alternate directly
export default function BottomInputClient(props) {
    return React.createElement(Kui, {...props,...{bottomInput:true}})
}
