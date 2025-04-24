import { BasePage, timeout } from '@framework';
import { HomePage, homePage } from './homePage';
import { contactsPage, ContactsPage } from './contactsPage';

const route = '/';
const selectors = {
  mainMenu : "//nav[contains(@style, 'visible')]/ul",
  home : "(//nav[contains(@style, 'visible')]/ul/li[contains(.,'Home')])[1]",
  contact : "//nav[contains(@style, 'visible')]/ul/li[contains(.,'Contact')]",
  aboutus : "//nav[contains(@style, 'visible')]/ul/li[contains(.,'About Us')]",
  clients : "//nav[contains(@style, 'visible')]/ul/li[contains(.,'Clients')]"
};
export class menuNames {
  static home = 'Home'; 
  static contact = 'Contact'; 
  static aboutus = 'About Us'; 
  static clients = 'Clients';
}

class MainMenu extends BasePage {
    constructor () {
        super (selectors, route);
    }

    public async navLink(name: string): Promise<string> {
      const nameSanitised = name.toLowerCase().replace(' ', '');
      
      const navEle = await this.getElement(this.getSelector(nameSanitised) + "//a");

      const hrefVal = await (await navEle.getProperty('href'));
      return (hrefVal as string);
    }

    async navigateHome(): Promise<HomePage> {
      const url = await this.currentUrl();
      this.log(`Current url '${url}'`);

      if (url !== undefined && !url.includes(this.route))
      {
        await this.log(`Navigate to home page`, async () => {
          this.navigateRoute("mainMenu", timeout.LONG)
          await this.waitForElementVisible("home", timeout.MEDIUM);
        });
      }
      
      return homePage;
    }

    private  async navigateLink(name: string) {
      await this.navigateHome()
      const nameSanitised = name.toLowerCase().replace(' ', '');

      return this.log(`Navigate to ${nameSanitised}`, async () => {

        await this.waitForElementVisible(nameSanitised, timeout.SHORT);
        await this.click(nameSanitised)
        await this.waitForElementVisible(`//h1[contains(.,'${name}')]`, timeout.MEDIUM);
      });
    }

    async navigateContacts(): Promise<ContactsPage> {
      
      await this.navigateLink(menuNames.contact);
    
      return contactsPage;
    }

    async navigateAboutus(): Promise<unknown> {

      return await this.navigateLink(menuNames.aboutus);
    }

    async navigateClients(): Promise<unknown> {
      return await this.navigateLink(menuNames.clients);
    }

}

let mainMenu; export default mainMenu = new MainMenu()
