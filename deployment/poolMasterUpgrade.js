require('@nomiclabs/hardhat-ethers');

let gasPrice;

async function verifyContract(hre, contractAddress, ctorArgs) {
  await hre.run('verify:verify', {
    address: contractAddress,
    constructorArguments: ctorArgs,
  });
}

const proxy = '0xd719c34261e099Fdb33030ac8909d5788D3039C4';
const staking = '0x6A345cdaBA1B34cC74b877530CF28aD43b2bF2C7';
const gov = '0xef5a1404E312078cd16B7139a2257eD3bb42F787';
const rewardsDist = '0x3c25D80F41c41daa574f4dCD3Eaf3C9851962C1a';
let mintFeeBps = 0;
let claimFeeBps = 0;
let burnFeeBps = 10;

task('deployPool', 'deploy pool master contract').setAction(async (taskArgs, hre) => {
  const BN = ethers.BigNumber;
  const [deployer] = await ethers.getSigners();
  deployerAddress = await deployer.getAddress();
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
