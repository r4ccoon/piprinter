const shellExec = require("shell-exec");
const logger = require("./Logger");

class PrintService {
  constructor(jobService) {
    this.jobService = jobService;
    this.jobs = {};
  }

  printAll() {
    let counter = 0;
    setInterval(() => {
      this.jobService.getQueues().then(jobs => {
        this.addJobs(jobs);
        this.print();
      });

      counter++;
      console.log(counter);
    }, 3000);
  }

  addJobs(jobs) {
    jobs.forEach(job => {
      if (job._id in this.jobs) {
        return;
      }

      this.jobs[job._id] = job;
    });
  }

  print() {
    for (let i in this.jobs) {
      let job = this.jobs[i];

      if (job.isPrinted) {
        continue;
      }

      console.log("printing " + job._id);

      this._printOne(job);
    }
  }

  _printOne(job) {
    let text = job.text;

    let commandStr = this._generatePrintText(text);

    shellExec(commandStr)
      .then(res => {
        if (res.stderr) {
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
          } else {
            console.log("failed to print " + job._id);
          }
        }

        // save locally the isPrinted status, whether success or not.
        job.isPrinted = true;
      })
      .catch(err => {
        logger.error(err);
      });
  }

  _generatePrintText(text) {
    return `echo "${text}" >> ${process.env.LINE_PRINTER_PATH}`;
  }
}

module.exports = PrintService;
