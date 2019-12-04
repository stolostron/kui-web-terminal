/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

/*
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const debug = require('debug')('proxy/exec')
const {wsURL} = require('./terminal')
const express = require('express')

module.exports = () => {

  const exec = commandExtractor =>
    async function (req, res) {

      const { command } = commandExtractor(req)
      const wsOpen = command === 'bash websocket open'
      debug('command', command)
      if (wsOpen) {
        res.send({
          type: 'object',
          response: {
            url: wsURL
          }
        });
      } else {
        res.status(400).send({ type: 'Error', response: 'Invalid request' })
      }

    }
  const router = express.Router()

  /** POST exec */
  router.post('/', exec(req => req.body))
  return router
}
