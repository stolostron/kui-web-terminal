var ICP_EXTERNAL_URL = process.env["ICP_EXTERNAL_URL"] || "https://mycluster.icp:8443";
const url = require('url');
const https = require('https');
const querystring = require('querystring');

module.exports.verifyAccessToken = (accessToken) => {
    return new Promise(function (resolve, reject) {
      if (!accessToken) {
        return reject(new Error("Unable to verify user info. Access token is blank."));
      }
      const userInfoUrl = url.parse(ICP_EXTERNAL_URL + "/idprovider/v1/auth/exchangetoken");
      console.log("verify token with " + userInfoUrl.href);
      let req = https.request({
        protocol: userInfoUrl.protocol,
        hostname: userInfoUrl.hostname,
        port: userInfoUrl.port,
        path: userInfoUrl.path,
        method: "POST",
        rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        json: true,
        form: {
          access_token: accessToken
        }
      }, function (res) {
        let body = "";
        res.on('data', function (chunk) {
          body = body + chunk;
        });
        res.on('end', function () {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error("Unable to verify user info. Status code " + res.statusCode + " returned."));
          }
          let json = JSON.parse(body);
          if (json.id_token) {
            return resolve(json.id_token);
          }
          reject(new Error("Unable to verify user info. No id_token in exchangetoken response."));
        })
      });
      let data = querystring.stringify({
        'access_token': accessToken
      });
      req.write(data);
      req.on('error', function (err) {
        reject(new Error(err.message));
      });
      req.end();
    })
  }