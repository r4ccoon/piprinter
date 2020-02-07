const StitchClient = require("./StitchClient.js");

class JobService {
  constructor() {
    this._stitchClient = new StitchClient();
  }

  getQueues() {
    this._stitchClient.client
      .callFunction("getQueues")
      .then(docs => {
        console.log(docs);
      });
  }
}

module.exports = JobService;
