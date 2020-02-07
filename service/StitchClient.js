const { Stitch, UserApiKeyCredential } = require("mongodb-stitch-server-sdk");
const logger = require("./Logger");

class StitchClient {
  constructor() {
    this._login();
  }

  _login() {
    this.client = Stitch.initializeDefaultAppClient(process.env.APP_ID);
    this.client.auth
      .loginWithCredential(new UserApiKeyCredential(process.env.API_KEY))
      .then(user => {
        logger.info(user.isLoggedIn);
        logger.info(user.auth.activeUserAuthInfo.userProfile.data.name);

        this.isLoggedIn = user.isLoggedIn;
        this.user = user.auth.activeUserAuthInfo.userProfile.data;
        this.client.close();
      })
      .catch(err => {
        logger.error(err);
        this.client.close();
      });
  }
}

module.exports = StitchClient;
