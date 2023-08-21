//IMPORTS:

import 'expect-puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot'
expect.extend({ toMatchImageSnapshot })
import { TOO_MAP_MODEL_LINK, ONE_SECOND, ONE_MINUTE, HALF_SECOND, baseURL, KeastSpinalModelGroups, ScalettaNeurons } from './util_constants'
import { wait4selector, click_, range, canvasSnapshot, fullpageSnapshot } from './helpers';
const path = require('path');
var scriptName = path.basename(__filename, '.js');
import * as selectors from './selectors'
const axios = require('axios').default;
const fs = require('fs');


//SNAPSHOT
const SNAPSHOT_OPTIONS = {
    customSnapshotsDir: `./test/snapshot_tests/snapshots/${scriptName}`,
    comparisonMethod: 'ssim',
    customDiffConfig: {
        ssim: 'fast',
    },
    failureThresholdType: 'percent',
    failureThreshold: 0.1 //best one to allow some minor changes in display 
};


//TESTS:
jest.setTimeout(ONE_MINUTE * 2);

describe('Access Open Physiology Viewer', () => {

    beforeAll(async () => {
        console.log(`Starting ${scriptName} ...`)
    });

    it('Main Page: Open Physiology Viewer', async () => {

        await page.goto(baseURL);
        await console.log(page.url())
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

        page.on('response', response => {
            const client_server_errors = range(200, 400)
            for (let i = 0; i < client_server_errors.length; i++) {
                expect(response.status()).not.toBe(client_server_errors[i])
            }
        })

        await wait4selector(page, selectors.BASE_PAGE_SELECTOR, { timeout: ONE_MINUTE });

        const model_name = await page.evaluate(() => {
            let map = document.querySelectorAll('.w3-bar-item');
            for (var i = 0; i < map.length; i++) {
                return map[3].innerHTML;
            }
        });

        expect(model_name).toBe(' Model: TOO-map-linked reference connectivity model ')

    });


})

describe('Load Scaletta Map', () => {


    it('Load Scaletta Map', async () => {
        console.log('Loading Scaletta Map ...')

        await page.waitForSelector(selectors.LOAD_BUTTON_SELECTOR)

        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click(selectors.LOAD_BUTTON_SELECTOR)
        ]);
        await fileChooser.accept([__dirname + '/assets/scaletta4.json']);

        await page.waitForTimeout(2000);

        const model_name = await page.evaluate(() => {
            let map = document.querySelectorAll('.w3-bar-item');
            for (var i = 0; i < map.length; i++) {
                return map[3].innerHTML;
            }
        });

        expect(model_name).toBe(' Model: scaletta model series #4 ')
        console.log('Model Scaletta loaded')

    })

    it('TOO Map Validation', async () => {
        console.log('TOO Map Validation ...')
        await page.waitForTimeout(ONE_SECOND * 6);
        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'TOO Map')
        await page.waitForTimeout(2000);
        console.log('TOO Map validated')
    })



    it('Enable NeuroView', async () => {
        console.log('Enabling NeuroView ...')
        await page.waitForTimeout(ONE_SECOND)
       
        await page.waitForSelector(selectors.NEUROVIEW_CHECKBOX_SELECTOR, { hidden: false })
        await page.click(selectors.NEUROVIEW_CHECKBOX_SELECTOR)

        await page.waitForTimeout(ONE_SECOND)
        console.log('NeuroView enabled ')

    })


})

describe('Toggle Dynamic Groups - Neuron 10', () => {

    it('Scaletta Model: Neuron 10 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[74].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[0])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 10', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 10') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 10')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })


})

describe('Toggle Dynamic Groups - Neuron 11', () => {

    it('Scaletta Model: Neuron 11 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[75].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[1])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 11', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 11') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 11')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })



})

describe('Toggle Dynamic Groups - Neuron 5', () => {

    it('Scaletta Model: Neuron 5 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[76].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[2])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 5', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 5') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 5')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })


})

describe('Toggle Dynamic Groups - Neuron 6', () => {

    it('Scaletta Model: Neuron 6 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[77].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[3])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 6', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 6') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 6')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })



})

describe('Toggle Dynamic Groups - Neuron 7', () => {

    it('Scaletta Model: Neuron 6 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[78].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[4])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 7', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 7') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 7')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })


})

describe('Toggle Dynamic Groups - Neuron 8', () => {

    it('Scaletta Model: Neuron 8 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[79].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[5])
        console.log('Neuron verified')


    })

    it('Toggle Neuron 8', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 8') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 8')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')

    })


})


describe('Toggle Dynamic Groups - Neuron 9', () => {

    it('Scaletta Model: Neuron 9 verification', async () => {
        console.log('Verifying neuron  ...')
        await page.waitForSelector('span.mat-slide-toggle-content')
        const dynamic_group = await page.evaluate(() => {
            let map = document.querySelectorAll('span.mat-slide-toggle-content');
            for (var i = 0; i < map.length; i++) {
                return map[80].innerText
            }
        });
        expect(dynamic_group).toContain(ScalettaNeurons[6])
        console.log('Neuron verified')

    })

    it('Toggle Neuron 9', async () => {
        console.log('Toggling the Neuron ...')
        await page.waitForSelector('.mat-slide-toggle-label')
        await page.waitForTimeout(ONE_SECOND)

        await page.evaluate(() => {
            let map = document.querySelectorAll('.mat-slide-toggle-label');
            for (var i = 0; i < map.length; i++) {
                map[i].innerText.includes('Neuron 9') && map[i].click();
            }
        });

        await canvasSnapshot(page, selectors.MAIN_PANEL_SELECTOR, SNAPSHOT_OPTIONS, 'Neuron 9')
        await page.waitForTimeout(ONE_SECOND * 3);
        console.log('Neuron toggled successfully')
    })


})






