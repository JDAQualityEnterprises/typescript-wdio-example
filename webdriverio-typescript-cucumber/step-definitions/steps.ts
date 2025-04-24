import { Given, When, Then } from '@cucumber/cucumber';
import data from "../../data/testData";
import mainMenu, { menuNames } from '../../pages/mainMenu';
import { homePage } from '../../pages/homePage';
import { expect } from 'chai';
import assertion from 'soft-assert';

Given ('User has site details', async function() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(data.website).to.be.an("object").to.not.be.empty;
})

When ('User navigates to the home page', async function() {
  await mainMenu.navigateHome();
})

Then ('the correct title is displayed for the home page', async function() {
    const title = await homePage.title();

    expect(title).to.be.equal(`JDA Quality Enterprises Limited`)
})

Then ('the navighation links are correct', async function() {
  
  assertion.softAssert(await (await mainMenu.navLink(menuNames.home)), `${browser.options.baseUrl}/home`);
  assertion.softAssert(await (await mainMenu.navLink(menuNames.contact)), `${browser.options.baseUrl}/contact`);
  assertion.softAssert(await (await mainMenu.navLink(menuNames.clients)), `${browser.options.baseUrl}/clients`);
  assertion.softAssert(await (await mainMenu.navLink(menuNames.aboutus)), `${browser.options.baseUrl}/about-us`);

  assertion.softAssertAll();
})

Then ('the email is displayed correctly', async function() {
      
  const emailText = await homePage.getEmail();

  assertion.softAssert(emailText, data.website.email);
  assertion.softAssertAll();
})

