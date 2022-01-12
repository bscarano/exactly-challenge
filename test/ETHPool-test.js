const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const ETHPool = await ethers.getContractFactory("ETHPool");
    const pool = await ETHPool.deploy();
    await pool.deployed();
  });
});
