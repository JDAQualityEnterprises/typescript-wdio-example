import data from '../../data/testData';
import mainMenu, { menuNames } from '../../pages/mainMenu';
import { homePage}  from '../../pages/homePage';
import { reporting } from '@framework';
import assertion from 'soft-assert';

describe('Home page tests @functional', function() {
  before(async function() {
    await mainMenu.navigateHome();
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await reporting.reportFailure(this, this.currentTest)
    }
  });

  it('has title @functional @sanity', async function () {
    
      await expect(browser).toHaveTitle("JDA Quality Enterprises Limited")
  })

  it("has links", async function () {
    
      const siteInfo= data.website
      
      const emailText = await homePage.getEmail();
      
      assertion.softAssert(await (await mainMenu.navLink(menuNames.home)), `${browser.options.baseUrl}/home`);
      assertion.softAssert(await (await mainMenu.navLink(menuNames.contact)), `${browser.options.baseUrl}/contact`);
      assertion.softAssert(await (await mainMenu.navLink(menuNames.clients)), `${browser.options.baseUrl}/clients`);
      assertion.softAssert(await (await mainMenu.navLink(menuNames.aboutus)), `${browser.options.baseUrl}/about-us`);

      assertion.softAssert(emailText, siteInfo.email);
      assertion.softAssertAll();
  });
});
