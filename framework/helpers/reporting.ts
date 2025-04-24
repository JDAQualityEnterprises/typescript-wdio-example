/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import fsextra from "fs-extra";
import path from "path";
import { getLogger } from "log4js";
import moment from "moment";
import mergeResults from 'wdio-mochawesome-reporter/mergeResults';

class Reporting {
  private logger = getLogger("default");

  private reporterName(config): string {
    if (config.length == 1){
      const reportName = config[0][0];

      return reportName;
    }
  }

  private isCucumberTest(config): boolean {
    if (config.length == 1){
      const reportName = this.reporterName(config);

      if (config.length == 1 && (reportName == "cucumberjs-json")) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  
  getReportPath(): string {

    // We need navigate up to the report folder from where this package 
    // is installed in the node_modules folder. It's a consistent starting 
    // point where we can create the reports folder we will use
    //return path.join(__dirname, '..', '..', '..', '..', '..', 'reports');
    return './reports';
  }

  /**
   * Add a screenshot to the report
   * 
   * @example
   *    onPrepare: () => {
   *      setupReporter(this);
   *   },
   *
   * @remarks
   * 
   * @param config The context from the current test
   *  
   */
  setupReporter(config: object) {
      const reportPath = this.getReportPath()

      // Create report output folder if it doesn't exist
      if (!fs.existsSync(reportPath)) {
          fs.mkdirSync(reportPath);
      }
      // delete previous test results and report file
      fsextra.emptyDir(reportPath);

      return this.logger;
  }

  screenshotFileName(testTitle): string {
    // We know we are always going to be in the node_modules, so have a consistent starting point
    const dirPath = this.getReportPath();

    // TODO - either check and replace all vals
    const suffix = moment().format("YYYYMMDDHHmmssS")
    const title = `${testTitle.replace(/ /g, "_").split('@')[0]}-${suffix}.png`;
    return path.join(dirPath, title);
  }

  /**
   * Add a screenshot to the report
   * 
   * @example
   *  // typescript example
   *  afterEach(async function() {
   *    if (this.currentTest.state === 'failed') {
   *        await reportScreenshot(this, this.currentTest.title);
   *    }
   *  });
   * 
   *  // Cucumber example
   *  After(function(scenario) {
   *    if (scenario.result.status === 'failed') {
   *       reportScreenshot(this, scenario.pickle.name);
   *    }
   *  })
   * 
   * @remarks
   * 
   * @param testTitle The title of the current test being run
   * @returns Promise
   * 
   */
  async reportScreenshot(testTitle?: string): Promise<Buffer> {
    this.logger.debug(`Create screenshot for title ${testTitle}`);
    const mochaReportFile = this.screenshotFileName(testTitle);

    if (mochaReportFile != undefined) {
      if (typeof browser != "undefined") {
        try {
          const reportObj = browser.options['reporters'];
          
          if (this.isCucumberTest(reportObj)){
            import('wdio-cucumberjs-json-reporter').then(async (cucumberJson) => {
              const buffer = await browser.takeScreenshot();
              cucumberJson.default.attach(buffer, 'image/png'); // sub step
            });
          }else {
              await browser.saveScreenshot(mochaReportFile);
          }

          return Promise.resolve(reportObj);
        } catch(e) {
          throw new Error(`Failed to save screenshot to file '${mochaReportFile}' (${e})`);
        }
      }
    }
  }

 /**
   * Add text to current test report
   * 
   * @example
   *  reportLog(this, "My nice message here")
   * 
   * @remarks
   * 
   * @param message The string you want to report
   * @returns Promise
   * 
   */
  async reportLog(message: string, step: boolean): Promise<void> {

    this.logger.info(message)
    
    if (typeof browser != "undefined") {
        const reportObj = browser.options['reporters'];
        

      if (this.isCucumberTest(reportObj)){
        import('wdio-cucumberjs-json-reporter').then((cucumberJson) => {
          if (step) {
            cucumberJson.default.attach(message); // top level step
          } else {
            cucumberJson.default.attach("  " + message); // sub step
          }
        }); 
      } else {
        import('wdio-mochawesome-reporter').then((reporter) => {
          if (step) {
            return reporter.default.addContext(message); // top level step
          } else {
            return reporter.default.addContext(this, "  " + message); // sub step
          }
        })
      }
    }
  }

  /**
   * Capture the SEVERE level browser logs
   * 
   * @example
   *  reportBrowserLogs(this)
   * 
   * @remarks
   *  This will only work for Chrome browser and capture SEVERE level browser log messages
   * 
   * @returns Promise
   * 
   */
  async reportBrowserLogs(){
      const errorLogs = await browser.getLogs('browser');

      if (errorLogs.length > 0){
        await this.reportLog(`SEVERE BROWSER LOGS:`, true);
        let messagesToLog = "";
        
        errorLogs.forEach( async (entry: any) => {
            messagesToLog = messagesToLog + `${entry.message}\n`
      });
      
      await this.reportLog(messagesToLog, true);
    }
  }
 
  /**
   * Report failure
   * 
   * @example
   *  Mocha:
   *   afterEach(async function() {
   *    if (this.currentTest.state === 'failed') {
   *     await reporting.reportFailure(this, this.currentTest)
   *    }
   *   });
   * 
   *  Cucumber
   *  After(async function(scenario) {
   *    if (scenario.result.status === 'failed') {
   *     await reporting.reportFailure(this, scenario)
   *    }
   *  })
   * 
   * @remarks
   *  This calls reportScreenshot and reportBrowserLogs
   * 
   * @param context The context from the current test / hook
   * @param testObject The mocha or cucumber test object 
   * 
   * @returns Promise
   * 
   */
  async reportFailure(context:any, testObject:any){
    let testTitle = "";
    const reportObj = browser.options['reporters'];

    if (this.isCucumberTest(reportObj)){
      // Handle if this is called from the cucumber'After' hook or 'afterStep' hook
      if (typeof testObject.pickle != 'undefined')
      {
        testTitle = testObject.pickle.name;
      } else {
        testTitle = testObject.name ;
      }
    } else {
      testTitle = testObject.title;
    }

    // Perform tasks on failure
    await this.reportScreenshot(testTitle)
    await this.reportBrowserLogs();
  }

 

  /**
   * Perform any necessary steps required to generate the report after a test run
   * 
   * @example
   *    onComplete: () => {
   *      generateReport(options);
   *   },
   *
   * @remarks
   * 
   * @param config The context from within the onComplete
   * 
   */
   generateReport(config: any, options?:any): void {
    const reportersConfig = config['reporters'];
    
    if (this.isCucumberTest(reportersConfig)){
      import("cucumber-html-reporter").then((reporter) => {
        reporter.generate(options)
      });
    } else {
      mergeResults('./reports', "results-*", "merged-results.json");
    }
  }
}

let reporting; export default reporting = new Reporting()