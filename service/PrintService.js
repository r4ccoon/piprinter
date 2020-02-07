const shellExec = require("shell-exec");
const usbPrinterPath = "/dev/usb/lp0";

class PrintService {
  constructor() {
    this.jobs = [];
  }

  addJobs(jobs) {
    this.jobs.concat(jobs);
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
            console.log(res);
            this.jobs[i].isPrinted = true;
          })
          .catch(console.log);
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
