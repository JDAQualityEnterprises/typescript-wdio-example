/* eslint-disable @typescript-eslint/no-explicit-any */
import { configure, getLogger } from "log4js";
import time from "./types/timeout";
import reporting from "./helpers/reporting";
import fs from 'fs'

export default class BasePage {
    protected route = '';

     /**
     * Selectors object contains named key-value pairs
     *
     * @example
     *    {
     *      firstNameTbx : 'firstName',
     *      lastNameTbx : 'lastName',
     *    }
     * 
     * @remarks
     *   All the selectors need to be stored in the selectors object.
     *   Be consistent and use the same selector type where possible   
     *
     * @internal 
     */
    protected selectors: {
        /*
        selectorName: selector
        */
    };    
    protected logger = getLogger('default');
    private defaultConfig = {
        "appenders": {
            "console" : {
                "type": "console",
                "category": "console"
            },
        },
            "categories": {
            "default" :{"appenders": ["console"], "level": "INFO"},
        }
    }

    /**
     *  Constructor for base page, specify the object selectors and route 
     * 
     *  @param selectors The object containing all the selector properties
     *  @param route Specify the URL part that relates to this page (e.g. "/inventory" )
     *               the route will be appended to the base URL specified in the configuration file
     * 
     * @remarks
     *   All the selectors need to be stored in the selectors object.
     *   Be consistent and use the same selector type where possible   
     *
     */
    constructor (sels: unknown, route: string){
        // TODO - check for config
        configure(this.defaultConfig);

        if(typeof sels === 'object'){
            // TODO - validate selectors
            this.selectors = sels;
        } else {
            throw new Error('First argument is expected to be a selector object')
        }

        if(typeof route === 'string'){
            this.route = route;
            return this;
        } else {
            throw new Error('Second argument is expected to be a route string')
        }
    }
   
     /**
     * Log a message to the test reporter, subsequent log calls are indented if called within the 'body'
     * 
     * @example
     *   page.log('My nice message here', async () => {
     *      page.log(`Another Message with a parameter '${myParameter}'`);
     *   });
     * 
     * @remarks
     *   Example report output from above example:
     * 
     *     My nice message here
     *         Another Message with a parameter 'stuff'
     * 
     * @param message The message to be logged
     * @param body An optional parameter, a callback for test sub steps reporting
     * @returns Promise 
     * 
     */
      public async log(message: string, body?: () => unknown): Promise<any> {
        await reporting.reportLog(message, body != undefined)
            
        if (body !== undefined ) { return body(); }
    }

     /**
     * Navigate to the route, as specified at creation
     *
     * @example
     *   page.navigateRoute("selectorName", timeout.MEDIUM)
     * 
     * @remarks
     *   Navigate to the route defined at creation 
     *
     * @param waitFor The name of the element to wait till it is present in the page DOM after navigation to the route
     * @param timeout The length of time to wait in milliseconds (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns Promise: Void
     * 
     */
    public async navigateRoute (waitFor?:string, timeout?:number): Promise<void | true>{
        await browser.url(this.route);
     
        if(waitFor!==undefined) {
            await this.getElement(waitFor, timeout);
            return true;
        }
    }

     /**
     * Return the title of the page
     *
     * @example
     *  let title = page.title()
     * 
     * @remarks
     *   Return the title of the page
     *
     * @returns Promise: Return the title of the page
     * 
     */
    public async title (): Promise<string> {
        return browser.getTitle();
    }
     
    /**
     * Return the heading of the page
     *
     * @example
     *  let heading = page.heading()
     * 
     * @remarks
     *   Return the heading of the page
     *
     * @param level The name index of heading to query to retrieve 
     * 
     * @returns Promise: Return the heading of the page as a string
     * 
     */
    public async heading (level: number = 1): Promise<string> {
        return (await this.getElement(`//h${level}`)).getText();
    }

     /**
     * Return url of the currently displayed page
     *
     * @example
     *  let url = page.currentUrl()
     * 
     * @remarks
     *   Return url of the currently displayed page
     *
     * @returns Promise: A string of the absolute URL 
     * 
     */
    public async currentUrl (): Promise<string> {
        return browser.getUrl();
    }

    /**
     *  Simplified click command to get the element, and then perform the click on the element
     * 
     * @example
     *  await this.click('saveVetButton');
     * 
     * @param selName The name of the selector to use to identify the element to retrieve 
     * @param timeout Wait duration for element to be clickable in the page (DOM) in milliseconds (default is timeout.NONE)
     */
    public async click(selName:string, timeout:number = time.NONE): Promise<void> {
        const selector = this.getSelector(selName);
        let message: string;
        if(selector !== selName){
            message = `Element '${selName}' with locator '${selector}' was clicked`;
        } else {
            message = `Element with dynamic locator '${selector}' was clicked`;
        }
        if(timeout > 0){
            await (await this.waitForElementClickable(selName, timeout)).click();
        } else {
            try {
                await (await this.getElement(selName)).click();
            } catch(error) {
                await this.highlightElement(selName);
                throw error;
            }
        }
        this.log(message);       
    }

    /**
     *  Simplified sendKeys command to get the element, and then add the text in the element
     * 
     * @example
     *  await this.sendKeys('lastNameTbx', vet.lastName);
     * 
     * @param selName The name of the selector to use to identify the element
     * @param text The text to be typed in to the element 
     *   
     */
    public async sendKeys(selName:string, text: string): Promise<void> {
        const selector = this.getSelector(selName);
        let message: string;
        if(selector !== selName){
            message = `Element '${selName}' with locator '${selector}' value was set to '${text}'`;
        } else {
            message = `Element with dynamic locator '${selector}' value was set to '${text}'`;
        }
        try{
            await (await this.getElement(selName)).setValue(text);
            this.log(message);
        } catch(error){
            await this.highlightElement(selName);
            throw error;
        }
    }

     /**
     *  Command for input with type file (file upload)
     * 
     * @example
     *  await this.setInputFile('inputFile', pathToFile);
     * 
     * @param inputSelName The name of the selector to use to identify the input element
     * @param pathToFile The absolute path to the local file to be input 
     * @param unHideInput Sometimes it is required to make the file input visible and interactable, before inputting filePath
     *   
     */
      public async setInputFile(inputSelName:string, pathToFile: string, isHiddenInput = false): Promise<void> {
        const selector = this.getSelector(inputSelName);
        let message: string;

        // Check file pathToFile
        const fileExists = await fs.promises.stat(pathToFile).then(() => true, () => false);
        
        if(fileExists) {
            this.log(`File path '${pathToFile}' exists`);
        } else {
            const errMsg = `File path '${pathToFile}' does NOT exist!`;

            this.log(errMsg);
            throw new Error(errMsg);
        }

        if(selector !== inputSelName){
            message = `setInputFile on element '${inputSelName}' with locator '${selector}'`;
        } else {
            message = `setInputFile on element with dynamic locator '${selector}'`;
        }

        try{
            const element = await this.getElement(inputSelName)

            if (isHiddenInput) {
                this.log(`Unhide input on element '${selector}'`);
                await element.execute('arguments[0].removeAttribute("hidden");', element);
                await element.execute('arguments[0].style.display = "block";', element);
                
                this.log(`Wait for the input to be displayed..'`);
                await element.waitForDisplayed();
            }

            await (await element).setValue(pathToFile);
            this.log(message);
        } catch(error){
            await this.highlightElement(inputSelName);
            throw error;
        }
    }


    /**
     *  Simplified getText command to get the element, and then retrieve the text displayed in the element
     * 
     * @example
     *  const name = await nameItem.getText();
     * 
     * @param selName The name of the selector to use to identify the element to retrieve text from
     *   
     */
    public async getText(selName:string): Promise<string> {
        return this.getElement(selName).then(element => { return element.getText()});
    }

    /**
     *  Simplified getValue command to get the element, and then retrieve the value displayed 
     *  in a <textarea>, <select> or text <input> element
     * 
     * @example
     *  const value = await inputBox.getValue();
     * 
     * @param selName The name of the selector to use to identify the element to retrieve value from
     *   
     */
     public async getValue(selName:string): Promise<string> {
        return this.getElement(selName).then(element => { return element.getValue()});
    }


    /**
     *  Simplified selectByValue command to get the element, and select the option in a dropdown list
     * 
     * @example
     *  await this.selectByValue('specialitiesDropDown', vet.speciality);
     * 
     * @param selName The name of the selector to use to identify the element
     * @param dropDownItem The option in the drop down list to select
     *   
     */
    public async selectByValue(selName:string, dropDownItem: string): Promise<void> {
        return this.getElement(selName).then(element => { return element.selectByVisibleText(dropDownItem)});
    }

    /**
     * Return element for the selector name after waiting for element to be present in the Page DOM
     *
     * @example
     *  page.getElement('selectorName').doubleClick();
     *  page.getElement('selectorName', timeout.MEDIUM).doubleClick();
     * 
     * @remarks
     *   Return element that matches the given selector
     * 
     * @param selName The name of the selector to use to identify the element to retrieve 
     * @param timeout Wait duration for element to be present in the page (DOM) in milliseconds (default is 2 seconds)
     * @returns The element
     * 
     * @see timeout
     * 
     */
    public async getElement (selName:string, timeout:number = time.SHORT) {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' could not be found within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' could not be found within ${timeout/1000} seconds`;
        }
        await element.waitForExist({ timeout: timeout, timeoutMsg: errorMessage});
        return element;
    }
    
    /**
     * Return a list of elements that match the given selector after waiting for atleast 1 element to be present in the Page DOM
     *
     * @example
     *    let detailsList = await page.getElements('detailsList');
     *    let detailsList = await page.getElements('detailsList', timeout.MEDIUM);
     *    
     *    if (detailsList.length > 0)
     *    {
     *       // do stuff
     *    }
     * 
     * @param selName The name of the selector to use to identify the elements to retrieve 
     * @param timeout Wait duration for elements to be present in the page (DOM) in milliseconds (default is 2 seconds)
     * @returns List of elements
     * 
     * @see timeout
     * 
     */
    public async getElements (selName: string, timeout:number = time.SHORT) {
        const selector = this.getSelector(selName);
        const elements = await $$(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Elements '${selName}' with locator '${selector}' could not be found within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Elements with dynamic locator '${selector}' could not be found within ${timeout/1000} seconds`;
        }
        await browser.waitUntil(async () => 
            ((await elements.filter(element => element.waitForExist())).length > 0), { timeout: timeout, timeoutMsg: errorMessage });
        return elements;
    }

    /**
     * Return child element which is a descendant of the parent element for the selector name 
     *
     * @example
     *  page.getChildElement('selectorRow', 'selectorName');
     *  page.getChildElement('selectorRow', 'selectorName', timeout.MEDIUM);
     * 
     * @remarks
     *   Return child element which is a descendant of the parent element that matches the given selector 
     * 
     * @param parentSelName The name of the selector to retrieve the parent element
     * @param selName The name of the selector to to retrieve the child/descendant elements
     * @param timeout Wait duration for both (parent and child) elements to be present in the page (DOM) in milliseconds (default is 2 seconds)
     * @returns The element
     * 
     * @see timeout
     * 
     */
    public async getChildElement (parentSelName: string, selName:string, timeout:number = time.SHORT) {
        const selector = this.getSelector(selName);
        const element = await (await this.getElement(parentSelName, timeout)).$(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Child element '${selName}' with locator '${selector}' could not be found under parent element `+
            `'${parentSelName}' with locator '${this.selectors[parentSelName]}' within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Child element 'with dynamic locator '${selector}' could not be found under parent element `+
            `'${parentSelName}' with locator '${this.selectors[parentSelName]}' within ${timeout/1000} seconds`;
        }
        await element.waitForExist({ timeout: timeout, timeoutMsg: errorMessage});
        return element;
    }
    
    /**
     * Return a list of elements that are descendants of the parent element which match the given selector 
     *
     * @example
     *    let detailsList = await page.getChildElements('detailsSection', 'detailsList');
     *    let detailsList = await page.getChildElements('detailsSection', 'detailsList', timeout.MEDIUM);
     *    
     *    if (detailsList.length > 0)
     *    {
     *       // do stuff
     *    }
     * @param parentSelName The name of the selector to retrieve the parent element
     * @param selName The name of the selector to to retrieve the child/descendant elements
     * @param timeout Wait duration for both (parent and child) elements to be present in the page (DOM) in milliseconds (default is 2 seconds)
     * @returns List of elements
     * 
     * @see timeout
     */
    public async getChildElements (parentSelName: string, selName: string, timeout: number = time.SHORT) {
        const selector = this.getSelector(selName);
        const elements = await (await this.getElement(parentSelName, timeout)).$$(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Child elements '${selName}' with locator '${selector}' could not be found under parent element `+
            `'${parentSelName}' with locator '${this.selectors[parentSelName]}' within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Child elements 'with dynamic locator '${selector}' could not be found under parent element `+
            `'${parentSelName}' with locator '${this.selectors[parentSelName]}' within ${timeout/1000} seconds`;
        }
        await browser.waitUntil(
            async () => ((await elements.filter(element => element.waitForExist())).length > 0), { timeout: timeout, timeoutMsg: errorMessage});
        return elements;
    }


     /**
     * Get the selector string for the given selector name 
     *
     * @example
     *   const selector = page.getSelector('selectorName');
     * 
     * @param selName The name of the selector to retrieve 
     * @returns The specified selector as a string. If not found returns the parameter (useful for dynamic locators)
     * 
     */
    public getSelector (selName: string): string {
        const elementSelector = this.selectors[selName];
        if(!selName){
            throw new Error('selector is empty');
        } else if (!elementSelector) {
            // Adding support for dynamic locators by returning the selector name if not found in the selector collection
            return selName;
        }
        return elementSelector;
    }


     /**
     * Wait for an element to display the specified text
     *
     * @example
     *   let element = await page.waitForElementText('selectorName', 'completed', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve 
     * @param text The text to wait for the target element to contain
    *  @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
    public async waitForElementText (selName:string, text:string, timeout:number) {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' with text '${text}' `+
            `could not be found within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' with text '${text}' `+
            `could not be found within ${timeout/1000} seconds`;
        }
        return browser.waitUntil(
            async () => (await element.getText() === text), { timeout: timeout, timeoutMsg: errorMessage })
            .then(() => {return element;})
            .catch(async (error) => {await this.highlightElement(selName); throw error;});        
    }

      /**
     * Wait for an element to display text of a minimum length
     *
     * @example
     *   let element = await page.waitForElementTextMinLength('selectorName', 2, timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve 
     * @param minLength The minimum textlength to wait for the target element to contain
    *  @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
       public async waitForElementTextMinLength (selName:string, minLength: number, timeout:number) {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' with text length more than '${minLength}' `+
            `could not be found within ${timeout/1000} seconds (Actual: '${(await element.getText())}'(${(await element.getText()).length}))`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' with text length more than '${minLength}' `+
            `could not be found within ${timeout/1000} seconds (Actual: '${(await element.getText())}'(${(await element.getText()).length}))`;
        }
        return await browser.waitUntil(
            async () => (await element.getText() != null && (await element.getText()).length > minLength),{ timeout:timeout, timeoutMsg: errorMessage})
            .then(() => {return element ;})
            .catch(async (error) => {await this.highlightElement(selName); throw error;});
    }

    /**
     * Wait for an element to be visible within the given timeout period
     *
     * @example
     *   let element = await page.waitForElementVisible('selectorName', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve
    *  @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
    public async waitForElementVisible (selName:string, timeout:number) {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' has not been displayed within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' has not been displayed within ${timeout/1000} seconds`;
        }
        await element.waitForDisplayed({ timeout: timeout, timeoutMsg: errorMessage});
        return element;
    }

    /**
     * Wait for an element to be not visible within the given timeout period
     *
     * @example
     *   let element = await page.waitForElementInVisible('selectorName', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve
    *  @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns Returns boolean true on success
     * 
     * @see timeout
     * 
     */
    public async waitForElementInVisible(selName:string, timeout:number): Promise<true | void> {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' is still visible after ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' is still visible after ${timeout/1000} seconds`;
        }
        return await element.waitForDisplayed({ timeout: timeout, reverse: true, timeoutMsg: errorMessage});      
    }

    /**
     * Wait for an element to be clickable within the given timeout period
     *
     * @example
     *   let element = await page.waitForElementClickable('selectorName', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve
    *  @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
    public async waitForElementClickable (selName:string, timeout:number) {
        const selector = this.getSelector(selName);
        const element = await this.getElement(selName);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' has not been 'clickable' within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' has not been 'clickable' within ${timeout/1000} seconds`;
        }
        return browser.waitUntil(
            async () => (await element.isExisting()), { timeout: timeout, timeoutMsg: errorMessage })
            .then(() => {return element;})
            .catch(async (error) => {await this.highlightElement(selName); throw error;});
    }

    /**
     * Wait for an element to be selected within the given timeout period
     *
     * @example
     *   let element = await page.waitForElementSelected('selectorName', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve
     * @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
    public async waitForElementSelected (selName: string, timeout: number)  {
        const selector = this.getSelector(selName);
        const element = await this.getElement(selName);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' has not been 'selected' within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' has not been 'selected' within ${timeout/1000} seconds`;
        }
        return browser.waitUntil(
            async () => (await element.isSelected()), { timeout: timeout, timeoutMsg: errorMessage })
            .then(() => {return element;})
            .catch(async (error) => {await this.highlightElement(selName); throw error;});
    }

    /**
     * Wait for an element to contain the given value within the given timeout period
     *
     * @example
     *   let element = await page.waitForElementValue('selectorName', timeout_SHORT);
     * 
     * @param selName The name of the selector to use to identify the element to wait for and retrieve
     * @param value The value to wait for as specified as a string
     * @param timeout The length of time to wait for the element to meet the condition (e.g. timeout.SHORT, timeout.MEDIUM, timeout.LONG)
     * @returns The element that we waited for
     * 
     * @see timeout
     * 
     */
    public async waitForElementValue (selName: string, value: string, timeout: number)  {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        let errorMessage: string;
        if(selector !== selName){
            errorMessage = `Element '${selName}' with locator '${selector}' with value '${value}' has not be found `+
            `within ${timeout/1000} seconds`;
        } else {
            errorMessage = `Element with dynamic locator '${selector}' with value '${value}' has not be found `+
            `within ${timeout/1000} seconds`;
        }
        return browser.waitUntil(
            async () => (await element.getValue() === value),{ timeout: timeout, timeoutMsg: errorMessage})
            .then(() => {return element;})
            .catch(async (error) => {await this.highlightElement(selName); throw error;});
    }

     /**
     * Query if the specified element is present in the page DOM
     * 
     * @example
     *   let present = await page.isElementPresent('selectorName');
     * 
     *   if (present) 
     *   {
     *     page.log("Element is present! whoop whoop, im a bannana!")
     *   }
     * 
     * @param selName The name of the selector to use to identify the target element 
     * @returns Returns boolean true if the element is present, otherwise false
     * 
     */
    public async isElementPresent (selName: string): Promise<boolean>  {
        return (await this.getElement(selName)).isExisting();
    }

    /**
     * Query if the specified element is visible on the page
     * 
     * @example
     *   let visible = await page.isElementVisible('selectorName');
     * 
     *   if (visible) 
     *   {
     *     page.log("Element is visible! whoop whoop, im a bannana!")
     *   }
     * 
     * @param selName The name of the selector to use to identify the target element 
     * @returns Returns boolean true if the element is visible, otherwise false
     * 
     */
     public async isElementVisible (selName: string): Promise<boolean>  {
        return (await this.getElement(selName)).isDisplayed();
    }

     /**
     * Get the element in the specified table row index and column name  
     * 
     * @example
     *   let cell = await page.getTableColumnElement('tableSelectorName', 2, 'Column name');
     *   cell.click(); 
     *   
     * @param selName The name of the selector for the table element
     * @param row The numeric index of the row to target
     * @param column The string to match with the column name 
     * @param headerNameInSubElement Set to true, if the column name is in a sub element of the TH element
     * @returns Returns the element on success 
     * 
     */
    public async getTableColumnElement(selName: string, row: number, column: string, headerNameInSubElement = false) {
        const table = this.getElement(selName)
        const child = headerNameInSubElement? "//*" : ""; // If the column name is in an element underneath the TH element
        const ancestor = headerNameInSubElement? "//ancestor::th[1]" : ""; // If the column name is in an element underneath the TH element

        if(typeof table === 'object') {

            const columnElement = await (await table).$(`.//th${child}[contains(text(),'${column}')]`)
            if(await columnElement.isExisting()){
                const elem = await columnElement.$$(`.${ancestor}//preceding-sibling::th`)
                
                if (await elem.length == 1)
                {
                    return elem[1];
                } else {
                    throw new Error(`More than one header returned !`)
                }
            }
            else {
                throw new Error(`Unable to find column '${column}' for table selector '${selName}'`)
            }
        } else {
            throw new Error(`Unable to find table selector '${selName}'`)
        }
    }

     /**
     * Get the text in the specified table cell located by table row index and column name  
     * 
     * @example
     *   let cellText = await page.getTableColumnText('tableSelectorName', 2, 'Column name');
     * 
     * @param selName The name of the selector for the table element
     * @param row The numeric index of the row to target
     * @param column The string to match with the column name
     * @param headerNameInSubElement Set to true, if the column name is in a sub element of the TH element
     * @returns Returns the cell text on success 
     * 
     */
    public async getTableColumnText(selName: string, row: number, column: string, headerNameInSubElement = false): Promise<string> {
        
        this.log(`Get text for column '${column}' for table '${selName}'`);

        const ele = await this.getTableColumnElement(selName, row, column, headerNameInSubElement)
        
        const colText = await ele.getText()
        this.log(`Got text '${colText}'`);

        return colText ;
    }

    /**
     * Highlight the element for the given selector name
     *
     * @example
     *   this.highlightElement('selectorName');
     * 
     * @param selName The name of the selector to highlight
     * 
     */
    private async highlightElement (selName: string): Promise<void> {
        const selector = this.getSelector(selName);
        const element = await $(selector);
        if(await element.isExisting()){
            //this is useful when the screenshot is taken
            await element.scrollIntoView({block: "center"});
            await element.execute('arguments[0].style.backgroundColor = "#FDAAF47";', element);//provide a yellow background 
            await element.execute('arguments[0].style.outline = "#f00 solid 4px";', element); //provide a red outline
            this.log(`Highlighted '${selName}' element by setting element style`);
        }
        else{
            this.log(`Did not highlight '${selName}' element as it does not exist`);
        }
    }
}