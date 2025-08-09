const hre = require("hardhat");

async function main() {
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy();
  await certificateRegistry.waitForDeployment(); // gunakan ini di hardhat terbaru v6
  console.log("CertificateRegistry deployed to:", await certificateRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
