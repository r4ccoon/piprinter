const StitchClient = require("./StitchClient.js");

class JobService {
  constructor() {
    this._stitchClient = new StitchClient();
  }

  getQueues() {
    return this._stitchClient.client.callFunction("getQueues");
  }

  setIsPrinted(jobId) {
    console.log('setisprinted ' + jobId)
    return this._stitchClient.client.callFunction("setIsPrinted", jobId);
  }
}

module.exports = JobService;
