/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
const EventEmitter = require('events')
const debugW = require('debug')('proxy/kuichannel')
const debugE = require('debug')('proxy/kuichannel-error')
const MARKER = '\n'
const ReadyState = {
    CONNECTING:0,
    OPEN:1,
    CLOSING:2,
    CLOSED:3
}
function heartbeat() {
    debugW('heartbeat')
    this.isAlive = true
}
// customized channel for kui websocket connection
class CustomStdioChannelWebsocketSide extends EventEmitter {

    constructor(ws) {
        super()
        this.ws = ws
    }
    // bind child process with current websocket channel
    async init(child, pollInterval = 30000) {
        debugW('CustomStdioChannelWebsocketSide.init')

        // upstream client has sent data downstream; forward it to the subprocess
        this.ws.on('message', (data) => {
            debugW('forwarding message downstream')
            console.log('got message:',data)
            child.stdin.write(`${data}${MARKER}`)
        })

        // on pong response, indicate we remain alive
        this.ws.on('pong', heartbeat)

        this.ws.on('close', () => {
            debugW('killing child process, because client connection is dead')
            child.kill()
        })

        const self = this 
        const heartbeatInterval = setInterval(function ping() {
            if (self.ws.isAlive === false) {
                debugW('killing child process, because client connection did not respond to ping')
                child.kill()
                clearInterval(heartbeatInterval)
                return self.ws.terminate()
            }
            // assume it is dead until we get a pong
            self.ws.isAlive = false
            self.ws.ping(() => {
                // intentional no-op
            })
        }, pollInterval)

        child.on('exit', (code) => {
            debugW('child exit', code)
            this.emit('exit', code)
        })

        child.stderr.on('data', (data) => {
            if (data.length > 0) {
                debugE(data.toString())
            }
        })

        // underlying pty has emitted data from the subprocess
        let pending
        child.stdout.on('data', (data) => {
            const msg = data.toString()
            if (!msg.endsWith(MARKER)) {
                if (!pending) {
                    pending = msg
                } else {
                    pending += msg
                }
            } else {
                this.send(pending ? `${pending}${msg}` : msg)
                pending = undefined
            }
        })
    }

    /** Forcibly close the channel */
    close() {
        debugW('closing stdio channel')
        this.emit('exit')
    }

    /** emit 'message' on the other side */
    send(msg) {
        debugW('send', this.readyState === ReadyState.OPEN)

        if (msg === `open${MARKER}`) {
            this.readyState = ReadyState.OPEN

            // this signals exec.js that the websocket is ready; see channel.once('open', ...)
            this.emit('open')
        } else if (this.readyState === ReadyState.OPEN) {
            msg
                .split(MARKER)
                .filter(_ => _)
                .forEach(_ => {
                    debugW('forwarding child output upstream')
                    this.ws.send(`${_}${MARKER}`)
                })
        }
    }

    removeEventListener(eventType, handler) {
        this.off(eventType, handler)
    }
}
module.exports.CustomStdioChannelWebsocketSide = CustomStdioChannelWebsocketSide;