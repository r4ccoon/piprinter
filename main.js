const JobService = require("./service/JobService.js");
require('dotenv').config()

let jobService = new JobService();
jobService.getQueues();
