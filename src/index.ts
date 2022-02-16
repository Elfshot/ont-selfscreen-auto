import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFileSync, createReadStream } from 'fs';
import { resolve as resPath } from 'path';
import { scheduleJob } from 'node-schedule';
import fetch from 'node-fetch';
import formData from 'form-data';
import 'dotenv/config';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Main {
  private browserInstance: Browser;
  private page: Page;

  private webhookURL = process.env.WEBHOOK;
  private selectors = [
    ['.button__StyledButton-sc-1hmy6jw-0'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(2)'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(1)'],
    ['#none_of_the_above', '.button__StyledButton-sc-1hmy6jw-0'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(1)'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(1)'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(1)'],
    ['button.button__StyledButton-sc-1hmy6jw-0:nth-child(1)'],
  ];

  private focusSelector = 'div.approved-template__HyperlinkButton-sc-1edfyoq-8:nth-child(4)';
  private emulatedDevice = 'iPhone 13 Pro';

  private async startInstance() {
    if (!this.browserInstance || !this.browserInstance.isConnected()) {
      try {
        this.browserInstance = await puppeteer.launch({
          headless: true,
          args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', ''],
          //product: 'firefox',
          env: {
            TZ: 'America/Toronto'
          }
        });

        this.page = await this.browserInstance.newPage();
      } catch (e) {
        console.error(e);
        console.error('Failed to puppeteer launch. Restarting...');
        process.exit(0);
      }
    }
    //console.log('Instance started');
  }

  private async navigate() {
    await this.page.goto('https://covid-19.ontario.ca/school-screening/');
    
    for (const selectorArr of this.selectors) {
      for (const selector of selectorArr) {
        await this.page.click(selector);
        if (selectorArr[selectorArr.indexOf(selector) + 1]) await sleep(100);
      }
      await sleep(250);
    }
    
    await this.page.emulate(puppeteer.devices[this.emulatedDevice]);
    await this.page.$eval(this.focusSelector, e => {
      e.scrollIntoView({ block: 'end', inline: 'end' });
    });
    //console.log('Page navigated');
  }

  private async capture() {
    const image = await this.page.screenshot();
    const time = new Date().getTime();
    await this.browserInstance.close();
    writeFileSync(resPath(`./images/${time}.png`), image);
    //console.log('File written');
    return time;
  }

  public async getImage() {
    for (let i = 0; i < 10; i++) {
      try {
        await this.startInstance();
        await this.navigate();
        return await this.capture();
      
      } catch(e) {
        console.error(e);
        await sleep(10000); continue;
      }
    }
  }

  private async distribute(time: number) {
    const form = new formData();
    form.append('Covid-Check', createReadStream(`./images/${time}.png`));
    const postData = {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    };

    fetch(this.webhookURL, postData);
    console.log('Message Sent');
  }

  public async run() {
    scheduleJob('COVID-Runner', '10 8 * * *', async () => {
      await this.distribute(await this.getImage());
      process.exit(0);
    });
  }
}

new Main().run();