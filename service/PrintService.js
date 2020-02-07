const shellExec = require("shell-exec");
const logger = require("./Logger");

const usbPrinterPath = "/dev/usb/lp0";

class PrintService {
  constructor() {
    this.jobs = [];
  }

  addJobs(jobs) {
    this.jobs = this.jobs.concat(jobs);
  }

  print() {
    let counter = 0;
    setInterval(() => {
      for (let i in this.jobs) {
        let text = this.jobs[i].text;
        if (this.jobs[i].isPrinted) {
          continue;
        }

        let commandStr = this._generatePrintText(text);

        console.log("printing " + this.jobs[i]._id);

        shellExec(commandStr)
          .then(res => {
            if (res.stderr) {
              logger.error(res.stderr);
            } else {
              console.log(res);
              //todo: update stitch here
            }

            this.jobs[i].isPrinted = true;
          })
          .catch(err => {
            logger.error(err);
          });
      }

      counter++;
      console.log(counter);
    }, 2000);
  }

  _generatePrintText(text) {
    return `echo "${text}" >> ${usbPrinterPath}`;
  }
}

module.exports = PrintService;
