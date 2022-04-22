import puppeteer from 'puppeteer';
const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

const snapshotTestConfig = {
  comparisonMethod: 'ssim',
  failureThreshold: 0.01,
  failureThresholdType: 'percent'
}

async function selectCanvasOnly(page){
  return page.evaluate(() => {
    (document.querySelectorAll('.banner') || []).forEach(el => el.remove());
  });
}

function renderUsingPuppeteer(modelName) 
{
  return puppeteer.launch({ headless: true })
  .then((browser)=>{
    return browser.newPage()
    .then((page)=>{
      return page.goto(`file:///${__dirname}/../dist/test-app/index.html?initModel=${modelName}}`)
      .then(()=>{
        return page.screenshot()
        .then((image)=>{
          return Promise.resolve(image);
        })    
      })
      page.close();
    })
    browser.close();
  });
}

test("BasalGanglia", () => {
  return renderUsingPuppeteer("BasalGanglia")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
});

// describe("BasalGangliaInternal", () => {

// });

// describe("BasalGangliaAuto", () => {

// });

// describe("Basic", () => {

// });

// describe("BasicChainsInGroup", () => {

// });

// describe("BasicHostedNode", () => {

// });

// describe("BasicLyphOnBorder", () => {

// });

// describe("BasicLyphTypes", () => {

// });

// describe("BasicHousedTree", () => {

// });

// describe("BasicJointTrees", () => {

// });

// describe("BasicLyphsWithNoAxis", () => {

// });

// describe("BasicSharedNodes", () => {

// });

// describe("BasicVillus", () => {

// });

// describe("FullBody", () => {

// });

// describe("KeastSpinal", () => {

// });

// describe("Neuron", () => {

// });

// describe("NeuronTemplate", () => {

// });

// describe("NeuronTemplateRegion", () => {

// });

// describe("NeuronTree", () => {

// });

// describe("NeuronTreeWithLevels", () => {

// });

// describe("Respiratory", () => {

// });

// describe("RespiratoryInternalLyphsInLayers", () => {

// });

// describe("Uot", () => {

// });