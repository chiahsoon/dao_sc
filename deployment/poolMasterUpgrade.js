require('@nomiclabs/hardhat-ethers');

let gasPrice;

async function verifyContract(hre, contractAddress, ctorArgs) {
  await hre.run('verify:verify', {
    address: contractAddress,
    constructorArguments: ctorArgs,
  });
}

const proxy = '0x9AAb3f75489902f3a48495025729a0AF77d4b11e';
const staking = '0xeadb96F1623176144EBa2B24e35325220972b3bD';
const gov = '0x7Ec8FcC26bE7e9E85B57E73083E5Fe0550d8A7fE';
const rewardsDist = '0x5EC0DcF4f6F55f28550c70B854082993fdc0D3B2';
let mintFeeBps = 0;
let claimFeeBps = 0;
let burnFeeBps = 10;

task('upgradePool', 'upgrade pool master contract').setAction(async (taskArgs, hre) => {
  const BN = ethers.BigNumber;
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`Deployer address: ${deployerAddress}`);

  // contract deployment
  gasPrice = new BN.from(32).mul(new BN.from(10).pow(new BN.from(9)));
  const PoolMasterUpgrade = await ethers.getContractFactory('PoolMaster');
  //TODO: Update this with the address of the first deployment of the proxy
  let proxyContract = await ethers.getContractAt('PoolMaster', "0xED0804d4Cac089B28dC42b97D61b385E04011494");

  if(PoolMasterUpgrade.getVersionNumber() > proxyContract.getVersionNumber()) {
    let contract = await upgrades.upgradeProxy(proxyContract.address, PoolMasterUpgrade.connect(deployer));
    await contract.deployed();
    console.log(`Address: ${contract.address}`);
    //TODO: Not sure if this stays the same
    await verifyContract(hre, contract.address, [
      'KNC Pool Test',
      'KNCP',
      proxy,
      staking,
      gov,
      rewardsDist,
      mintFeeBps,
      claimFeeBps,
      burnFeeBps,
    ]);
    console.log('setup completed');
  }else{
    console.log('Error: New contract does not have higher version number than old contract')
  }
  process.exit(0);
});
