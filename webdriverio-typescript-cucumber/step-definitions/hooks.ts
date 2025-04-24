import { After, Status } from '@cucumber/cucumber';
import { reporting } from '@framework';

After(async function(scenario) {

    if (scenario.result.status === Status.FAILED) {
        return reporting.reportFailure(this, scenario)
    }
})
