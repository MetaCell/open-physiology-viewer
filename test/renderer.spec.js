import {
  describe,
  it,
  before,
  after,
  expect
} from './test.helper';

const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

import {expectNoWarnings} from "./test.helper";
import {modelClasses, fromJSON} from '../src/model/index';
import {$LogMsg, Logger} from "../src/model/logger";

async function removeBanners(page){
  await page.evaluate(() => {
    (document.querySelectorAll('.banner') || []).forEach(el => el.remove());
  });
}

function renderUsingPuppeteer(modelName) 
{
  const page = await browser.newPage();

  //TODO change this to local server
  await page.goto(`file:///Users/infectuz/Work/MetaCell/open-physiology-viewer/dist/test-app/index.html?initModel=${modelName}}`);

  await removeBanners(page);

  const image = await page.screenshot();

  expect(image).toMatchImageSnapshot();
}

describe("BasalGanglia", () => {
  
});

describe("BasalGangliaInternal", () => {

});

describe("BasalGangliaAuto", () => {

});

describe("Basic", () => {

});

describe("BasicChainsInGroup", () => {

});

describe("BasicHostedNode", () => {

});

describe("BasicLyphOnBorder", () => {

});

describe("BasicLyphTypes", () => {

});

describe("BasicHousedTree", () => {

});

describe("BasicJointTrees", () => {

});

describe("BasicLyphsWithNoAxis", () => {

});

describe("BasicSharedNodes", () => {

});

describe("BasicVillus", () => {

});

describe("FullBody", () => {

});

describe("KeastSpinal", () => {

});

describe("Neuron", () => {

});

describe("NeuronTemplate", () => {

});

describe("NeuronTemplateRegion", () => {

});

describe("NeuronTree", () => {

});

describe("NeuronTreeWithLevels", () => {

});

describe("Respiratory", () => {

});

describe("RespiratoryInternalLyphsInLayers", () => {

});

describe("Uot", () => {

});