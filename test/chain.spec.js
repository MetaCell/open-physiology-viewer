import {
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
} from './test.helper';
import keastSpinalTest from './data/keastSpinalTest';

import {modelClasses} from '../src/model/index';

describe("Generate groups from chain templates (Keast Spinal)", () => {
    let graphData;
    beforeEach(() => {
        graphData = modelClasses.Graph.fromJSON(keastSpinalTest, modelClasses);
    });

    it("Housing chain template expanded", () => {
        expect(graphData).to.have.a.property("chains");
        expect(graphData.chains).to.be.an('array').that.has.length(3);

        const ch1 = graphData.chains[0];
        expect(ch1).to.be.an('object');
        expect(ch1).to.have.property("id").that.equal("ch1");
        expect(ch1).to.have.property("numLevels").that.equal(16);
        expect(ch1).to.have.property("levels").that.is.an('array');
        expect(ch1.levels.length).to.be.equal(16);

        expect(graphData).to.have.a.property("nodes");
        expect(graphData.nodes).to.be.an('array');

        const n1 = graphData.nodes.find(x => x.id === "n1");
        expect(n1).to.be.an('object');
        expect(n1).to.have.property("rootOf");
        expect(n1.rootOf).to.be.an('array').that.has.length(1);
        expect(n1.rootOf[0]).to.have.property("id").that.equal("ch1");

        const n2 = graphData.nodes.find(x => x.id === "n2");
        expect(n2).to.be.an('object');
        expect(n2).to.have.property("leafOf");
        expect(n2.leafOf).to.be.an('array').that.has.length(1);
        expect(n2.leafOf[0]).to.have.property("id").that.equal("ch1");

        expect(graphData).to.have.a.property("groups");
        expect(graphData.groups).to.be.an('array').that.has.length(3);
        const gr1 = graphData.groups[0];
        expect(gr1).to.be.an('object');
        expect(gr1).to.have.property("id").that.equal("group_ch1");
        expect(gr1).to.have.property("generated").that.equal(true);

        expect(gr1).to.have.property("nodes").that.is.an('array');
        expect(gr1.nodes.length).to.be.equal(17);
        expect(gr1.nodes[0]).to.be.an('object');
        expect(gr1.nodes[0]).to.have.property('id').that.equal("n1");
        expect(gr1.nodes[16]).to.be.an('object');
        expect(gr1.nodes[16]).to.have.property('id').that.equal("n2");

        expect(gr1).to.have.property("links").that.is.an('array');
        expect(gr1.links.length).to.be.equal(16);
        expect(gr1.links[0]).to.have.property("next");
        expect(gr1.links[0].next).to.be.an('array').that.has.length(1);
        expect(gr1.links[0].next[0]).to.have.property("id").that.equals(gr1.links[1].id);
        expect(gr1.links[1]).to.have.property("prev");
        expect(gr1.links[1].prev).to.be.an('array').that.has.length(1);
        expect(gr1.links[1].prev[0]).to.have.property("id").that.equals(gr1.links[0].id);
    });

    it("Tree chains are generated", () => {
        const t1 = graphData.chains[1];
        expect(t1).to.be.an('object');
        expect(t1).to.have.property("id").that.equal("nn1");
        expect(t1).to.have.property("numLevels").that.equal(7);
        expect(t1).to.have.property("levels").that.is.an('array');
        expect(t1.levels.length).to.be.equal(7);
        expect(graphData).to.have.a.property("lyphs");
        expect(graphData.lyphs).to.be.an('array');
        const genLyphs = graphData.lyphs.filter(e => e.id && e.id.startsWith("nn1_"));
        expect(genLyphs).to.be.an('array');
        expect(genLyphs.length).to.equal(7);
        expect(genLyphs[0]).has.property("supertype");
        expect(genLyphs[0].supertype).to.be.an('object');
        expect(genLyphs[0].supertype).to.have.property("id").that.equal("229");
    });

    it("Lyphs inherit properties from supertype", () => {
        const lyphs = graphData.lyphs.filter(e => e.supertype && e.supertype.external && e.supertype.external.length > 0);
        expect(lyphs).to.have.length.above(1);
        expect(lyphs[0]).to.have.property("inheritedExternal");
        expect(lyphs[0].inheritedExternal).to.be.an('array');
        expect(lyphs[0].inheritedExternal).to.have.length(1);
        expect(lyphs[0].inheritedExternal[0]).to.be.instanceOf(modelClasses.External);
        expect(lyphs[0].inheritedExternal[0]).to.have.property("id").that.equal("UBERON:0005844");
    });

    it("Lyphs retain own annotations", () => {
        const c1 = graphData.lyphs.find(x => x.id === "c1");
        expect(c1).to.have.property("external");
        expect(c1.external).to.be.an('array').that.has.length(1);
        expect(c1.external[0]).to.be.instanceOf(modelClasses.External);
        expect(c1.external[0]).to.have.property("id").that.equal("UBERON:0006469");
    });

    it("Internal lyphs are rebased into generated layers", () => {
        const c3 = graphData.lyphs.find(x => x.id === "c3");
        expect(c3).to.have.property("internalLyphs");
        //the input model contains "soma" as internal lyph of c3 which is removed from the generated model and placed to c3's layer
        expect(c3.internalLyphs).to.be.an('array').that.has.length(0);
        expect(c3).to.have.property("internalLyphsInLayers");
        expect(c3.internalLyphsInLayers).to.be.an('array').that.has.length(1);
        expect(c3.internalLyphsInLayers[0]).to.be.equal(3);

        expect(c3).to.have.property("layers");
        expect(c3.layers).to.be.an('array').that.has.length(14);
        //assuming counting of layers from 0
        expect(c3.layers[3]).to.have.property("id").that.equal("ref_mat_KM_27_K_129_c3_4");
        expect(c3.layers[3]).to.have.property("internalLyphs");
        expect(c3.layers[3].internalLyphs).to.be.an('array').that.has.length(1);
        expect(c3.layers[3].internalLyphs[0]).to.be.an('object');
        expect(c3.layers[3].internalLyphs[0]).to.have.property("class").that.equal("Lyph");
        expect(c3.layers[3].internalLyphs[0]).to.have.property("id").that.equal("soma");
    });

    it("Neuron chains are embedded to the correct housing lyph layers", () => {
        const t1 = graphData.chains.find(chain => chain.id === "ch1");
        expect(t1).to.be.an('object');
        expect(t1).to.have.property("housingLayers").that.is.an('array');
        //expect(t1).to

    });

    //TODO check that neuron trees are embedded to the correct housing lyph layers
    // "KM_9", "KM_23", "K_86", "KM_27", "K_85", "K_84", "K_83", "K_82", "K_81", "K_80", "K_79", "K_78", "K_77", "KM_27"
    //  2, 3, 4, 5, 6, 7, 8

    afterEach(() => {});
});
