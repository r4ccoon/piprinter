const JobService = require("./service/JobService.js");
const PrintService = require("./service/PrintService.js");
require("dotenv").config();

let jobService = new JobService();

let printService = new PrintService(jobService);
printService.getQueuesAndPrintAll();
