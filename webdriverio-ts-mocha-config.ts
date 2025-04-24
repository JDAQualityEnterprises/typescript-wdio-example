import reporting from './framework/helpers/reporting';

exports.config = {
    runner: 'local',
    specs: [
        'webdriverio-typescript-mocha/specs/*.spec.js'
    ],
    baseUrl: "https://www.jdaqualitylimited.com",
    capabilities: [{
        browserName: 'chrome',
        webSocketUrl: true,
        'goog:chromeOptions': {
          // to run chrome headless the following flags are required
          // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
            args: ['--headless', '--disable-gpu', '--disable-dev-shm-usage','--no-sandbox', '--start-maximized'],
          }
    }],
    logLevels: {
      webdriver: 'warn'
    },
    framework: 'mocha',
    mochaOpts: {
        bail: false,
        timeout: 60000
    },
    reporters: [["mochawesome", {
      stdout: false, outputDir: "./reports",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      outputFileFormat: function (opts: any) {
          return `results-${opts.cid}.${opts.capabilities.browserName}.json`
      }
    }]],
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
