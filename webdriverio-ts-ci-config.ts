/* eslint-disable @typescript-eslint/no-explicit-any */
import { reporting } from '@framework';
import WdioMochawesomeReporter from "wdio-mochawesome-reporter"

exports.config = {
    runner: 'local',
    specs: [
        'dist/webdriverio-typescript-mocha/specs/*.spec.js'
    ],
    baseUrl: 'https://jdaqualitylimited.com',
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
          // ignore bluetooth related warnings/errors
          excludeSwitches: ['enable-logging'],
          // to run chrome headless the following flags are required
          // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
          args: ['--headless', '--disable-gpu', '--disable-dev-shm-usage','--no-sandbox', '--start-maximized']
        }
    }],
    logLevels: {
      webdriver: 'warn'
    },
    framework: 'mocha',
    mochaOpts: {
        bail: false,
        timeout: 60000,
        grep: '@functional'
    },
    reporters: [[WdioMochawesomeReporter, {
        stdout: false, outputDir: "./reports",
        outputFileFormat: function (opts: any) {
            return `results-${opts.cid}.${opts.capabilities.browserName}.json`
        }
    }]],
    services: [['chromedriver', {
      chromedriverCustomPath:'/usr/bin/chromedriver'}]
    ],
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'tsconfig.json'
        }
    },
    onPrepare: function(){
      reporting.setupReporter(this);
    },

    onComplete: function (exitCode:number, config: object, capabilities: unknown, results: unknown) {

      reporting.generateReport(config);
    }
}
