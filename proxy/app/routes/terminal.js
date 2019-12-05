/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
const { getUser, NOBODY_GID, deleteUser } = require('../lib/userUtils');
const { spawn } = require('child_process');
const { join, dirname } = require('path');
const url = require('url');
const { parse: parseCookie } = require('cookie');
const WebSocket = require('ws');
const wsURL = process.env.KUI_INGRESS_PATH ? `/${process.env.KUI_INGRESS_PATH}/terminal` : '/terminal';
const wss = new WebSocket.Server({ noServer: true });
const mainPath = join(dirname(require.resolve('@kui-shell/core')), 'main/main.js');
const { CustomStdioChannelWebsocketSide } = require('../lib/kuichannel');
const debug = require('debug')('proxy/terminal');
const accessTokenKey = 'cfc-access-token-cookie'

const createChild = (user, locale) => {
    const uid = user.uid;
    const gid = NOBODY_GID;
    const options = {
        uid,
        gid,
        cwd: user.env.HOME,
        env: Object.assign(user.env, {
            LOCALE: locale,
            SHELL: 'rbash',
            DEBUG: process.env.DEBUG,
            DEVMODE: true,
            KUI_HEADLESS: true,
            KUI_REPL_MODE: 'stdout',
            KUI_EXEC_OPTIONS: JSON.stringify({
                "noHistory": true,
                "rethrowErrors": true,
                "type": 2,
                "nested": true,
                "isProxied": true,
                "credentials": {}
            })
        })
    };
    const child = spawn(process.argv[0], [mainPath, 'bash', 'websocket', 'stdio'], options);

    child.on('error', err => {
        debug('subprocess error:', err);
    });

    child.on('exit', code => {
        debug('subprocess exit', code);
        debug('deleting user data');
        //clean user data
        deleteUser(user.name).catch((e) => {
            console.error(`failed to delete ${user.name}:`, e)
        });
    });
    return child;

}
//initUserSession will login user with cloudctl and create child process with uid/gid set properly
const initUserSession = async (accessToken, locale) => {
    let user = {};
    debug('init user session')
    user = await getUser(accessToken);
    const child = createChild(user, locale);
    return { user, child }

}

//bindChannel will bind the channel of websocket and child process
const bindChannel = async (ws, child) => {
    try {
        const channel = new CustomStdioChannelWebsocketSide(ws);
        await channel.init(child, process.env.KUI_HEARTBEAT_INTERVAL || 30000)
        channel.once('closed', (exitCode /* : number */) => {
            debug('channel closed', exitCode)
        })
        channel.once('open', () => {
            debug('channel open')
        })
        return
    } catch (e) {
        const msg = typeof e === 'string' ? e : e && e.message;
        if (msg) {
            const retMsg = { type: 'error', message: msg };
            ws.send(JSON.stringify(retMsg));
        }
        throw (e);
    }
}


module.exports.wsURL = wsURL;
// expose server to path wss://server/terminal for websocket connection
// to work with kui's bash-like plugin, we have to provide a exitNow callback to close websocket connection
module.exports.setupWSS = (server) => {
    server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = url.parse(request.url).pathname;
        console.log('upgrade request from', pathname);

        if (pathname === wsURL) {
            try {
                // varify user
                let accessToken = parseCookie(request.headers.cookie || '')[accessTokenKey];
                const locale = (request.headers['accept-language'] && request.headers['accept-language'].split(',')[0]) || 'en';
                if (process.env.NODE_ENV === 'development') {
                    accessToken = process.env.AUTH_TOKEN;
                }
                // ready to connect, handle websocket
                //set up child process and websocket
                initUserSession(accessToken, locale).then((data) => {
                    return new Promise((resolve, reject) => {
                        const user = data.user;
                        const child = data.child;
                        if (!user || !child) {
                            reject('failed to create user and child process');
                        } else {
                            wss.handleUpgrade(request, socket, head, function done(ws) {
                                wss.emit('connection', ws, request);

                                bindChannel(ws, child).then(() => {
                                    resolve('');
                                }).catch((e) => {
                                    console.error('failed in connect channel', e);
                                    ws.close();
                                    reject(e);
                                })
                            });
                        }
                    })
                }).catch(e => {
                    console.error('failed to init user session', e);
                    console.error('close websocket connection');
                    socket.destroy();
                });
            } catch (e) {
                console.error('websocket connection failed.', e);
                socket.destroy();
            }
        } else {
            console.error('websocket url error.');
            socket.destroy();
        }
    });
}