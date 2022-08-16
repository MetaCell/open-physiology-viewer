//IMPORTS:
import 'expect-puppeteer';
import * as puppeteer from "puppeteer";
import { toMatchImageSnapshot } from 'jest-image-snapshot'
expect.extend({ toMatchImageSnapshot })
import { ONE_SECOND, ONE_MINUTE, baseURL, scaffoldGroupName } from './utilConstants'
import { wait4selector, click_, range, canvasSnapshot, fullpageSnapshot } from './puppeteer_helper';
const path = require('path');
var scriptName = path.basename(__filename, '.js');



//SNAPSHOT
const SNAPSHOT_OPTIONS = {
    customSnapshotsDir: `./test/snapshots/${scriptName}`,
    comparisonMethod: 'ssim',
    customDiffConfig: {
        ssim: 'fast', //where higher accuracy is desired at the expense of time or a higher quality diff image is needed for debugging
    },
    failureThresholdType: 'percent',
    failureThreshold: 0.020 //best one to allow some minor changes in display 
};

//SELECTORS: 
const BASE_PAGE_SELECTOR = '#mat-tab-content-0-1';
const MAIN_PANEL_SELECTOR = '#main-panel';
const SHOW_SETTING_SELECTOR = 'button[title = "Show settings"]';
const HIDE_SETTINGS_SELECTOR = 'button[title = "Hide settings"]';
const MERGE_MODEL_SELECTOR = '#mergeBtn > i';




//TESTS:
jest.setTimeout(ONE_MINUTE * 2);

describe('Scaffold Model Elements', () => {



    beforeAll(async () => {

        console.log('Starting tests ...')

        page.on('response', response => {
            const client_server_errors = range(200, 400)
            for (let i = 0; i < client_server_errors.length; i++) {
                expect(response.status()).not.toBe(client_server_errors[i])
            }
        })

        page.on('requestfailed', request => {
            console.log('REQUEST FAILED')
            throw new Error(`Request failed - method: ${request.method()}, url: ${request.url()}, errText: ${request.failure().errorText}`)
        });

        page.on("pageerror", err => {
            console.log('ERROR')
            throw new Error(`Page error: ${err.toString()}`);
        });

        await page.goto(baseURL);
        // Setting user agent helps to speed up an otherwise extremely slow Chromium
        //    - https://github.com/puppeteer/puppeteer/issues/1718#issuecomment-425618798
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
    });




    it('Scaffold Model', async () => {
        await wait4selector(page, BASE_PAGE_SELECTOR, { timeout: ONE_MINUTE });
        await page.waitForTimeout(ONE_SECOND * 2)

        console.log('... taking full page snapshot ...')
        expect(await page.screenshot())
            .toMatchImageSnapshot({
                ...SNAPSHOT_OPTIONS,
                customSnapshotIdentifier: 'Scaffold Model (full page)'
            });

        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Scaffold Model (only canvas)')
    });

    it('Groups from Scaffold Model', async () => {
        console.log('Toggle Groups from Scaffold Model')

        await click_(page, SHOW_SETTING_SELECTOR)

        const ScaffoldGroups = await page.evaluate(() => document.querySelectorAll("span.mat-slide-toggle-content").length)
        expect(ScaffoldGroups).toBe(9)


        await fullpageSnapshot(page, SNAPSHOT_OPTIONS, 'Groups from Scaffold Model')

    })

    it('F Anchors, Wires and Regions from Scaffold Model', async () => {
        console.log('Toggle F Anchors, Wires and Regions from Scaffold Model')

        const anchor = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[0].innerText
            }
        });
        expect(anchor).toBe(scaffoldGroupName[0])

        const wire = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[3].innerText
            }
        });
        expect(wire).toBe(scaffoldGroupName[3])

        const region = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[6].innerText
            }
        });
        expect(region).toBe(scaffoldGroupName[6])

        await page.evaluate(() => {
            let map = document.querySelectorAll('div.mat-slide-toggle-bar');
            for (var i = 0; i < map.length; i++) {
                map[1].click();
                map[2].click();
                map[4].click();
                map[5].click();
                map[7].click();
                map[8].click();
            }
        });

        await click_(page, HIDE_SETTINGS_SELECTOR)


        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'F Anchors, Wires and Regions from Scaffold Model (only canvas)')

    })


    it('D Anchors, Wires and Regions from Scaffold Model', async () => {
        console.log('Toggle D Anchors, Wires and Regions from Scaffold Model')

        await click_(page, SHOW_SETTING_SELECTOR)


        const anchor = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[1].innerText
            }
        });
        expect(anchor).toBe(scaffoldGroupName[1])

        const wire = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[4].innerText
            }
        });
        expect(wire).toBe(scaffoldGroupName[4])

        const region = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[7].innerText
            }
        });
        expect(region).toBe(scaffoldGroupName[7])

        await page.evaluate(() => {
            let map = document.querySelectorAll('div.mat-slide-toggle-bar');
            for (var i = 0; i < map.length; i++) {
                map[0].click();
                map[1].click();
                map[3].click();
                map[4].click();
                map[6].click();
                map[7].click();
            }
        });

        await click_(page, HIDE_SETTINGS_SELECTOR)

        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'D Anchors, Wires and Regions from Scaffold Model (only canvas)')

    })



    it('N Anchors, Wires and Regions from Scaffold Model', async () => {
        console.log('Toggle N Anchors, Wires and Regions from Scaffold Model')

        await click_(page, SHOW_SETTING_SELECTOR)


        const anchor = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[2].innerText
            }
        });
        expect(anchor).toBe(scaffoldGroupName[2])

        const wire = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[5].innerText
            }
        });
        expect(wire).toBe(scaffoldGroupName[5])

        const region = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[8].innerText
            }
        });
        expect(region).toBe(scaffoldGroupName[8])

        await page.evaluate(() => {
            let map = document.querySelectorAll('div.mat-slide-toggle-bar');
            for (var i = 0; i < map.length; i++) {
                map[2].click();
                map[1].click();
                map[5].click();
                map[4].click();
                map[8].click();
                map[7].click();
            }
        });

        await click_(page, HIDE_SETTINGS_SELECTOR)


        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'N Anchors, Wires and Regions from Scaffold Model (only canvas)')

    })
})

describe('Scaffold Model Labels', () => {

    it('Scaffold Model Anchor Labels', async () => {
        console.log('Toggle Anchors Labels from Scaffold Model')

        await page.reload(); //refresh the page

        //add a connectivity model but do not enable it 
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click(MERGE_MODEL_SELECTOR),
        ]);
        await fileChooser.accept(['/Users/simaosa/Desktop/MetaCell/Projects/APINatomy/Automated Tests/Issue#164/APINatomy/Tests/assets/dev-layout-conn-model.json']);

        await page.waitForTimeout(2000);

        await click_(page, SHOW_SETTING_SELECTOR)

        await click_(page, 'div.mat-slide-toggle-bar') // disable 'Ungrouped'

        await click_(page, HIDE_SETTINGS_SELECTOR)

        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Scaffold Model Anchor Labels (only canvas)')

    })


    it('Scaffold Model Wire Labels', async () => {
        console.log('Toggle Wire Labels from Scaffold Model')

        await click_(page, SHOW_SETTING_SELECTOR)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-expansion-panel-header-title')
            for (var i = 0; i < map.length; i++) {
                map[i].innerText == 'Settings' && map[i].click();
            }
        })

        await click_(page, '#mat-slide-toggle-115') // Anchor label button (disable)

        await click_(page, '#mat-slide-toggle-114') // Wire label button (enable)

        await click_(page, HIDE_SETTINGS_SELECTOR)

        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Scaffold Model Wire Labels (only canvas)')

    })


    it('Scaffold Model Region Labels', async () => {
        await console.log('Toggle Region Labels from Scaffold Model')

        await click_(page, SHOW_SETTING_SELECTOR)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-expansion-panel-header-title')
            for (var i = 0; i < map.length; i++) {
                map[i].innerText == 'Settings' && map[i].click();
            }
        })

        await click_(page, '#mat-slide-toggle-175') // Wire label button (disable)

        await click_(page, '#mat-slide-toggle-180') // Region Label button (enable)

        await click_(page, HIDE_SETTINGS_SELECTOR)

        await canvasSnapshot(page, MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Scaffold Model Region Labels (only canvas)')

    })

});

