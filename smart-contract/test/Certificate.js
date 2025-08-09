const { expect } = require("chai");

describe("CertificateRegistry", function () {
  let CertificateRegistry, certificateRegistry, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    // HAPUS: await certificateRegistry.deployed();
  });

  it("Should deploy contract and have empty certificate mapping", async function () {
    const cert = await certificateRegistry.certificates("randomhash");
    expect(cert.hash).to.equal("");
    expect(cert.ipfsCid).to.equal("");
    expect(cert.valid).to.equal(false);
  });

  it("Should register a certificate", async function () {
    const hash = "abc123hash";
    const ipfsCid = "Qm123cid";
    await expect(certificateRegistry.registerCertificate(hash, ipfsCid))
      .to.emit(certificateRegistry, "CertificateRegistered")
      .withArgs(hash, ipfsCid, owner.address);

    const cert = await certificateRegistry.certificates(hash);
    expect(cert.hash).to.equal(hash);
    expect(cert.ipfsCid).to.equal(ipfsCid);
    expect(cert.issuer).to.equal(owner.address);
    expect(cert.valid).to.equal(true);
  });

  it("Should not allow duplicate registration", async function () {
    const hash = "abc123hash";
    const ipfsCid = "Qm123cid";
    await certificateRegistry.registerCertificate(hash, ipfsCid);

    await expect(
      certificateRegistry.registerCertificate(hash, ipfsCid)
    ).to.be.revertedWith("Certificate already registered");
  });

  it("Should verify certificate correctly (valid)", async function () {
    const hash = "testhash";
    const ipfsCid = "QmCID";
    await certificateRegistry.registerCertificate(hash, ipfsCid);

    const result = await certificateRegistry.verifyCertificate(hash);
    expect(result[0]).to.equal(true);           // valid
    expect(result[1]).to.equal(ipfsCid);        // ipfsCid
    expect(result[2]).to.equal(owner.address);  // issuer
  });

  it("Should return invalid for unregistered hash", async function () {
    const result = await certificateRegistry.verifyCertificate("notfoundhash");
    expect(result[0]).to.equal(false);          // valid
    expect(result[1]).to.equal("");             // ipfsCid
    expect(result[2]).to.equal("0x0000000000000000000000000000000000000000"); // issuer
  });

  it("Should revoke certificate and mark as invalid", async function () {
    const hash = "hashrevoke";
    const ipfsCid = "QmCIDrevoke";
    await certificateRegistry.registerCertificate(hash, ipfsCid);

    await certificateRegistry.revokeCertificate(hash);

    const cert = await certificateRegistry.certificates(hash);
    expect(cert.valid).to.equal(false);

    const result = await certificateRegistry.verifyCertificate(hash);
    expect(result[0]).to.equal(false); // valid
  });
});
