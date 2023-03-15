// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {  
  const InheritApesBAYC = await hre.ethers.getContractFactory("InheritApesBAYC");
  const inheritApesBAYC = await InheritApesBAYC.deploy();

  await inheritApesBAYC.deployed();

  console.log(
    `InheritApesBAYC contract deployed to ${inheritApesBAYC.address} by ${inheritApesBAYC.deployTransaction.from}`
  );
  
  const InheritApesMAYC = await hre.ethers.getContractFactory("InheritApesMAYC");
  const inheritApesMAYC = await InheritApesMAYC.deploy();

  await inheritApesMAYC.deployed();

  console.log(
    `InheritApesMAYC contract deployed to ${inheritApesMAYC.address} by ${inheritApesMAYC.deployTransaction.from}`
  );
  
  const InheritApesBAKC = await hre.ethers.getContractFactory("InheritApesBAKC");
  const inheritApesBAKC = await InheritApesBAKC.deploy();

  await inheritApesBAKC.deployed();

  console.log(
    `InheritApesBAKC contract deployed to ${inheritApesBAKC.address} by ${inheritApesBAKC.deployTransaction.from}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
