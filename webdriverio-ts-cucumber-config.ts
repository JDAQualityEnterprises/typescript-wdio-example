import reporting from './framework/helpers/reporting';
import options from './utils/cucumber.report.options'

exports.config = {
    runner: 'local',
    specs: [
        '../webdriverio-typescript-cucumber/features/**/*.feature'
    ],
    baseUrl: 'https://www.jdaqualitylimited.com',
    capabilities: [{
        browserName: 'chrome',
        webSocketUrl: true,
        'goog:chromeOptions': {
          // ignore bluetooth related warnings/errors
            excludeSwitches: ['enable-logging'],
          // to run chrome headless the following flags are required
          // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
            args: [ '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--start-maximized'],
          }
    }],
    logLevel: 'info',
    logLevels: {
      webdriver: 'warn',
      '@wdio/cucumber-framework': 'info',
      '@wdio/local-runner': 'info'
    },
    framework: 'cucumber',
    cucumberOpts: {
      require: [
        "./dist/webdriverio-typescript-cucumber/step-definitions/steps.js",
        "./dist/webdriverio-typescript-cucumber/step-definitions/hooks.js"
      ],
      backtrace: true,
      failFast: false,
      tags: '@functional',
      tagsInTitle: true,
      timeout: 60000
    },
    reporters: [
      ['cucumberjs-json', {
        jsonFolder: './reports',
        language: 'en',
      }]
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

    onComplete: function (exitCode:number, config: object, capabilities: object, results: object) {
      reporting.generateReport(config, options);
    }
}
