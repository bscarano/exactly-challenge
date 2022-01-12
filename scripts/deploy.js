async function main() {
  const ETHPool = await ethers.getContractFactory("ETHPool");
  const pool = await ETHPool.deploy();
  await pool.deployed();

  console.log("ETHPool deployed to:", pool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
