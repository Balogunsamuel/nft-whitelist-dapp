const { ethers } = require("hardhat");

async function main() {
  console.log("deploy...");
  const whitelist = await ethers.getContractFactory("Whitelist");
  console.log("Deploying.....");
  const deployWhitelist = await whitelist.deploy(15);
  await deployWhitelist.deployed();
  console.log(`Whitelist contract address: ${deployWhitelist.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
