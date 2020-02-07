const shellExec = require("shell-exec");
const usbPrinterPath = "/dev/usb/lp0";

class PrintService {
  constructor() {
    this.jobs = [];
  }

  addJobs(jobs) {
    this.jobs.concat(jobs);
    console.log("adding");
    console.log(this.jobs);
  }

  print() {
    let counter = 0;
    setInterval((jobs) => {
      for (let i in jobs) {
        let text = jobs[i].text;
        if (jobs[i].isPrinted) {
          continue;
        }

        let commandStr = this._generatePrintText(text);

        console.log("printing " + jobs[i]._id);

        shellExec(commandStr)
          .then(res => {
            console.log(res);
            jobs[i].isPrinted = true;
          })
          .catch(console.log);
      }

      counter++;
      console.log(counter);
    }, 2000, this.jobs);
  }

  _generatePrintText(text) {
    return `echo "${text}" >> ${usbPrinterPath}`;
  }
}

module.exports = PrintService;
