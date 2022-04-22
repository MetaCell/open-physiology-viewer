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
          page.close();
          browser.close();
          return Promise.resolve(image);
        })    
      })
    })
  });
}

test("BasalGanglia", () => {
  return renderUsingPuppeteer("BasalGanglia")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasalGangliaInternal", () => {
  return renderUsingPuppeteer("BasalGangliaInternal")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasalGangliaAuto", () => {
  return renderUsingPuppeteer("BasalGangliaAuto")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("Basic", () => {
  return renderUsingPuppeteer("Basic")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicChainsInGroup", () => {
  return renderUsingPuppeteer("BasicChainsInGroup")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicHostedNode", () => {
  return renderUsingPuppeteer("BasicHostedNode")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicLyphOnBorder", () => {
  return renderUsingPuppeteer("BasicLyphOnBorder")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicLyphTypes", () => {
  return renderUsingPuppeteer("BasicLyphTypes")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicHousedTree", () => {
  return renderUsingPuppeteer("BasicHousedTree")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicJointTrees", () => {
  return renderUsingPuppeteer("BasicJointTrees")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicLyphsWithNoAxis", () => {
  return renderUsingPuppeteer("BasicLyphsWithNoAxis")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicSharedNodes", () => {
  return renderUsingPuppeteer("BasicSharedNodes")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("BasicVillus", () => {
  return renderUsingPuppeteer("BasicVillus")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("FullBody", () => {
  return renderUsingPuppeteer("FullBody")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("KeastSpinal", () => {
  return renderUsingPuppeteer("KeastSpinal")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("Neuron", () => {
  return renderUsingPuppeteer("Neuron")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("NeuronTemplate", () => {
  return renderUsingPuppeteer("NeuronTemplate")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("NeuronTemplateRegion", () => {
  return renderUsingPuppeteer("NeuronTemplateRegion")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("NeuronTree", () => {
  return renderUsingPuppeteer("NeuronTree")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("NeuronTreeWithLevels", () => {
  return renderUsingPuppeteer("NeuronTreeWithLevels")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("Respiratory", () => {
  return renderUsingPuppeteer("Respiratory")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("RespiratoryInternalLyphsInLayers", () => {
  return renderUsingPuppeteer("RespiratoryInternalLyphsInLayers")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);

test("Uot", () => {
  return renderUsingPuppeteer("Uot")
  .then((image)=>{
    expect(image).toMatchImageSnapshot(snapshotTestConfig);
  })
}, 10000);