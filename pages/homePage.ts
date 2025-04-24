import { BasePage, timeout } from '@framework';

const route = '';

const selector = {
    emailLink : "//a[contains(@href, 'mailto')]"
}

export class HomePage extends BasePage {

    constructor(){
        super(selector, route);
    }

    public async getEmail(): Promise<string> {
        return this.log(`Get email`, async () => {
            const emailWithMailto = await (await this.getElement('emailLink')).getProperty('href');

            await this.log(`Got href property as '${emailWithMailto}'`)
            
            return (emailWithMailto as string).replace("mailto:", "")
        });
    }
}

export const homePage = new HomePage();
