const shellExec = require("shell-exec");
const logger = require("./Logger");

class PrintService {
  constructor(jobService) {
    this.jobService = jobService;
    this.jobs = {};
    this.counter = 0;
  }

  async getQueuesAndPrintAll() {
    this.jobService.getQueues().then(async (jobs) => {
      this.addJobs(jobs);
      await this.print();

      // after done printing all jobs, we get job queues again
      await this.sleep(3000);
      await this.getQueuesAndPrintAll();
    });

    this.counter++;
    console.log(this.counter);
  }
  
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  addJobs(jobs) {
    console.log("got " + jobs.length);

    jobs.forEach((job) => {
      if (job._id in this.jobs) {
        return;
      }

      this.jobs[job._id] = job;
    });
  }

  async print() {
    for (let i in this.jobs) {
      let job = this.jobs[i];

      if (job.isPrinted) {
        continue;
      }

      console.log("printing " + job._id);

      await this._printOne(job);
    }
  }

  _printOne(job) {
    let text = job.text;

    let commandStr = this._generatePrintText(text);

    return new Promise((resolve, reject) => {
      shellExec(commandStr)
        .then((res) => {
          if (res.stderr) {
            reject(res.stderr);
            logger.error(res.stderr);
          } else {
            /* example return
                {
                  stdout: '',
                  stderr: '',
                  cmd: 'echo "print this bro" >> /dev/usb/lp0',
                  code: 0
                }*/

            if (res.code === 0) {
              console.log("printed " + job._id);
              this.jobService.setIsPrinted(job._id);
              resolve("printed " + job._id);
            } else {
              console.log("failed to print " + job._id);
              reject("failed to print " + job._id);
            }
          }

          // save locally the isPrinted status, whether success or not.
          job.isPrinted = true;
        })
        .catch((err) => {
          logger.error(err);
        });
    });
  }

  _generatePrintText(text) {
    return `echo "${text}" >> ${process.env.LINE_PRINTER_PATH}`;
  }
}

module.exports = PrintService;
