
These examples demonstrate how a common framework can be used with mocha and cucumber tests 

# Basic typescript webdriver.io tests
* Seperation of framework from tests
* Base page objects 
* Domain page objects
* Reporting and logging
* Model objects for domain data
* html report generation

# Running tests from the container
* Build the image:
  * docker build -t example-wdio-docker .
* Run the tests in the container:
  * docker run -it -e example-wdio-docker

# Reporter configuration
---------
The following section details reporting setup for Mocha and Cucumber configuration

## Mocha
--------

# Using 'wdio-mochawesome-reporter' reporter

You will need to install the [wdio-mochawesome-reporter](https://www.npmjs.com/package/wdio-mochawesome-reporter) package

Ammend the reporter section of the config to the following:

```
import { WdioMochawesomeReporter } from 'wdio-mochawesome-reporter';

exports.config = {
..
..
    reporters: [[WdioMochawesomeReporter, {
            stdout: false, outputDir: "./reports",
            outputFileFormat: function (opts: any) {
                return `results-${opts.cid}.${opts.capabilities.browserName}.json`
            }
        }]],
..
..
}
```

# Using the 'wdio-json-html-reporter' reporter

You will need to install the [wdio-json-html-reporter](https://github.com/aswinchembath/wdio-json-html-reporter) package

Ammend the reporter section of the config to the following:

```
import { JSONReporter } from 'wdio-json-html-reporter';

exports.config = {
..
..
   reporters: [
      [JSONReporter, { outputFile: './reports/test-results.json', screenshotOption: 'OnFailure' }],  // Options: "No", "OnFailure", "Full"
    ],
..
..
}
```

## Cucumber
-----------
For cucumber reporting the 'wdio.conf.js' configuration file will need to specify the following configuration:

```
exports.config = {
..
..
    reporters: [
      ['cucumberjs-json', {
        jsonFolder: './reports',
        language: 'en',
      }]
    ],
..
..
}
```

## Html report generation

# Mocha

Run the npm script 'generate-report' to generate the html files

# Cucumber

No additional step is required, report is generated at the end of the run

