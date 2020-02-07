const JobService = require("./service/JobService.js");
const PrintService = require("./service/PrintService.js");
require("dotenv").config();

let printService = new PrintService();

let jobService = new JobService();

jobService.getQueues().then(jobs => {
  printService.addJobs(jobs);
});

printService.print();
