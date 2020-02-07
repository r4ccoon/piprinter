const StitchClient = require("./StitchClient.js");

class JobService {
  constructor() {
    this._stitchClient = new StitchClient();
  }

  getQueues() {
    return this._stitchClient.client.callFunction("getQueues");
  }
}

module.exports = JobService;
