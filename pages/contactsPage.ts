import { BasePage, timeout } from '@framework';

const route = '';

const selector = {
    emailLink :"//a[contains(@href, 'mailto')]",
}

export class ContactsPage extends BasePage {

    constructor(){
        super(selector, route);
    }
}

export const contactsPage = new ContactsPage();
