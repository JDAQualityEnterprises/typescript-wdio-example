import data from '../../data/testData';
import mainMenu from '../../pages/mainMenu';
import { reporting } from '@framework';
import assertion from 'soft-assert';

describe('Contacts page tests @functional', function() {
  before(async function() {
    await mainMenu.navigateHome();
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await reporting.reportFailure(this, this.currentTest)
    }
  });

  it('has heading @functional @sanity', async function () {
      const contactsPage = await mainMenu.navigateContacts();

      const heading = await contactsPage.heading();

      assertion.softAssert(heading, "Contact", 'Heading mismatch');
      assertion.softAssertAll();
  })
});
