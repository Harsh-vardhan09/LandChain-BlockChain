const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let landRegistry;
  let deployer;
  let inspector;
  let registrar;
  let buyer;
  let stranger;

  beforeEach(async function () {
    [deployer, inspector, registrar, buyer, stranger] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();

    const registrarRole = await landRegistry.REGISTRAR_ROLE();
    const inspectorRole = await landRegistry.INSPECTOR_ROLE();

    await landRegistry.grantRole(registrarRole, registrar.address);
    await landRegistry.grantRole(inspectorRole, inspector.address);
  });

  it("allows a registrar to register land", async function () {
    await expect(
      landRegistry.connect(registrar).registerLand(
        "Survey No. 42, Sector 5",
        "28.7041,77.1025",
        1200,
        "QmExampleHash123"
      )
    )
      .to.emit(landRegistry, "LandRegistered")
      .withArgs(1, registrar.address, "Survey No. 42, Sector 5");

    const lands = await landRegistry.getLandsByOwner(registrar.address);
    expect(lands.length).to.equal(1);
    expect(lands[0]).to.equal(1);

    const land = await landRegistry.getLandDetails(1);
    expect(land.landId).to.equal(1);
    expect(land.title).to.equal("Survey No. 42, Sector 5");
    expect(land.owner).to.equal(registrar.address);
  });

  it("prevents unauthorized users from registering land", async function () {
    await expect(
      landRegistry.connect(stranger).registerLand(
        "Plot No. 18, MG Road",
        "19.0760,72.8777",
        1500,
        "QmExampleHash456"
      )
    ).to.be.revertedWith(/AccessControl: account/);
  });

  it("allows an inspector to verify land", async function () {
    await landRegistry.connect(registrar).registerLand(
      "Block C, Whitefield",
      "12.9716,77.5946",
      1800,
      "QmExampleHash789"
    );

    await expect(landRegistry.connect(inspector).verifyLand(1))
      .to.emit(landRegistry, "LandVerified")
      .withArgs(1, inspector.address);

    const land = await landRegistry.getLandDetails(1);
    expect(land.isVerified).to.be.true;
  });

  it("prevents non-inspector users from verifying land", async function () {
    await landRegistry.connect(registrar).registerLand(
      "Ward 12, Ring Road",
      "13.0827,80.2707",
      2000,
      "QmExampleHash101"
    );

    await expect(landRegistry.connect(stranger).verifyLand(1)).to.be.revertedWith(/AccessControl: account/);
  });

  it("supports requestTransfer and approveTransfer full flow", async function () {
    await landRegistry.connect(registrar).registerLand(
      "Garden Plot, Sector 63",
      "28.4595,77.0266",
      1400,
      "QmExampleHash102"
    );

    await landRegistry.connect(inspector).verifyLand(1);
    await expect(landRegistry.connect(registrar).requestTransfer(1, buyer.address, "Gift"))
      .to.emit(landRegistry, "TransferRequested")
      .withArgs(0, 1, registrar.address, buyer.address);

    await expect(landRegistry.connect(deployer).approveTransfer(0))
      .to.emit(landRegistry, "TransferApproved")
      .withArgs(0, 1, registrar.address, buyer.address);

    const land = await landRegistry.getLandDetails(1);
    expect(land.owner).to.equal(buyer.address);

    const buyerLands = await landRegistry.getLandsByOwner(buyer.address);
    expect(buyerLands.length).to.equal(1);
    expect(buyerLands[0]).to.equal(1);
  });

  it("allows buying land with the correct payment and rejects incorrect payment", async function () {
    await landRegistry.connect(registrar).registerLand(
      "Plot No. 18, MG Road",
      "19.0760,72.8777",
      1500,
      "QmExampleHash456"
    );

    await landRegistry.connect(inspector).verifyLand(1);
    await landRegistry.connect(registrar).listForSale(1, ethers.parseEther("1"));

    await expect(
      landRegistry.connect(buyer).buyLand(1, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Incorrect payment amount");

    await expect(
      landRegistry.connect(buyer).buyLand(1, { value: ethers.parseEther("1") })
    )
      .to.emit(landRegistry, "LandSold")
      .withArgs(1, registrar.address, buyer.address, ethers.parseEther("1"));

    const land = await landRegistry.getLandDetails(1);
    expect(land.owner).to.equal(buyer.address);
    expect(land.isForSale).to.be.false;
  });

  it("enforces owner-only role checks for listing and document updates", async function () {
    await landRegistry.connect(registrar).registerLand(
      "Survey No. 42, Sector 5",
      "28.7041,77.1025",
      1200,
      "QmExampleHash123"
    );

    await landRegistry.connect(inspector).verifyLand(1);

    await expect(landRegistry.connect(stranger).listForSale(1, ethers.parseEther("0.1"))).to.be.revertedWith(
      "Only current owner can call this function"
    );

    await expect(landRegistry.connect(registrar).updateDocumentHash(1, "QmNewHash456"))
      .to.emit(landRegistry, "DocumentUpdated")
      .withArgs(1, "QmNewHash456");

    await landRegistry.grantRole(await landRegistry.REGISTRAR_ROLE(), stranger.address);
    await expect(landRegistry.connect(stranger).updateDocumentHash(1, "QmNewHash789"))
      .to.emit(landRegistry, "DocumentUpdated")
      .withArgs(1, "QmNewHash789");
  });
});
