const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("ETHPool", function () {
  let pool;

  let depositAmountAlice = ethers.utils.parseEther('100');
  let depositAmountBob = ethers.utils.parseEther('300');
  let rewardAmount = ethers.utils.parseEther('200');

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();

    const ETHPool = await ethers.getContractFactory("ETHPool");
    pool = await ETHPool.deploy();
    await pool.deployed();
  });

  describe("Single depositor", () => {
    it("WHEN deposit THEN event is emitted and balances are correct", async () => {
      let tx = await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });

      expect(tx).to.emit(pool, "Deposit").withArgs(alice.address, depositAmountAlice);
      expect(await pool.connect(alice).balance()).to.eq(depositAmountAlice);
      expect(await pool.connect(alice).reward()).to.eq(0);
      expect(await pool.connect(alice).totalDeposits()).to.eq(depositAmountAlice);
      expect(await pool.connect(alice).totalRewards()).to.eq(0);

      expect(tx).to.changeEtherBalance(pool, depositAmountAlice);
    });
    it("WHEN deposit/withdraw THEN deposit is returned", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      let tx = await pool.connect(alice).withdraw();

      expect(tx).to.changeEtherBalance(alice, depositAmountAlice);
      expect(tx).to.emit(pool, "Withdraw").withArgs(alice.address, depositAmountAlice, 0);      
      expect(await waffle.provider.getBalance(pool.address)).to.eq(0);

      expect(await pool.connect(alice).balance()).to.eq(0);
      expect(await pool.connect(alice).reward()).to.eq(0);
      expect(await pool.connect(alice).totalRewards()).to.eq(0);
    });
  });

  describe("Rewards", () => {
    it("WHEN deposit/reward THEN event is emitted and balances are correct", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      let tx = await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });

      expect(tx).to.emit(pool, "DepositReward").withArgs(owner.address, rewardAmount)
      expect(await pool.connect(alice).reward()).to.eq(rewardAmount);
      expect(await pool.connect(alice).totalRewards()).to.eq(rewardAmount);

      const total = depositAmountAlice.add(rewardAmount);
      expect(await waffle.provider.getBalance(pool.address)).to.eq(total);
    });
    it("WHEN deposit/reward/withdraw THEN event is emitted for deposit + full reward", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });

      let tx = await pool.connect(alice).withdraw();

      const total = depositAmountAlice.add(rewardAmount);
      expect(tx).to.changeEtherBalance(alice, total);
      expect(tx).to.emit(pool, "Withdraw").withArgs(alice.address, depositAmountAlice, rewardAmount);
    });
    it("WHEN reward after multiple deposits/rewards THEN withdraw all deposits + rewards", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });
      let tx = await pool.connect(alice).withdraw();

      expect(tx).to.emit(pool, "Withdraw").withArgs(alice.address, 
        depositAmountAlice.mul(2), 
        rewardAmount.mul(2));
    });
  });

  describe("Multiple depositors", () => {
    it("WHEN multiple depositors/reward THEN divide rewards", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(bob).deposit({ from: bob.address, value: depositAmountBob });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });
      let tx1 = await pool.connect(alice).withdraw();
      let tx2 = await pool.connect(bob).withdraw();

      expect(tx1).to.emit(pool, "Withdraw").withArgs(alice.address, depositAmountAlice, rewardAmount.div(4));
      expect(tx2).to.emit(pool, "Withdraw").withArgs(bob.address, depositAmountBob, rewardAmount.mul(3).div(4));
    });
  
    it("WHEN deposit/reward/deposit the reward only goes to the first depositor", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });
      await pool.connect(bob).deposit({ from: bob.address, value: depositAmountBob });
      let tx1 = await pool.connect(bob).withdraw();
      let tx2 = await pool.connect(alice).withdraw();
  
      expect(tx1).to.emit(pool, "Withdraw").withArgs(bob.address, depositAmountBob, 0);
      expect(tx2).to.emit(pool, "Withdraw").withArgs(alice.address, depositAmountAlice, rewardAmount);
    });
    it("WHEN multiple deposits and multiple rewards THEN divide rewards", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await pool.connect(bob).deposit({ from: bob.address, value: depositAmountBob });
      await pool.connect(bob).deposit({ from: bob.address, value: depositAmountBob });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });
      await pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount });

      let tx1 = await pool.connect(alice).withdraw();
      let tx2 = await pool.connect(bob).withdraw();

      expect(tx1).to.emit(pool, "Withdraw").withArgs(alice.address, depositAmountAlice.mul(2), rewardAmount.div(2));
      expect(tx2).to.emit(pool, "Withdraw").withArgs(bob.address, depositAmountBob.mul(2), rewardAmount.mul(3).div(2));
    });
  });

  describe("Roles", () => {
    it("WHEN owner rewards THEN it succeeds", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await expect(
        pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount })
      ).to.emit(pool, "DepositReward").withArgs(owner.address, rewardAmount)
    });
    it("WHEN bob added to team and rewards THEN it succeeds", async () => {
      let tx1 = await pool.connect(owner).addTeam(bob.address);
      expect(tx1).to.emit(pool, "AddTeam").withArgs(bob.address);

      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      let tx2 = await pool.connect(bob).depositReward({ from: bob.address, value: rewardAmount })      
      expect(tx2).to.emit(pool, "DepositReward").withArgs(bob.address, rewardAmount)
    });
    it("WHEN alice is added who then adds bob THEN it succeeds (transitivity)", async () => {
      let tx1 = await pool.connect(owner).addTeam(alice.address);
      expect(tx1).to.emit(pool, "AddTeam").withArgs(alice.address);

      let tx2 = await pool.connect(alice).addTeam(bob.address);
      expect(tx2).to.emit(pool, "AddTeam").withArgs(bob.address);
    });
  });

  describe("Error cases", () => {
    it("WHEN withdraw before any deposits THEN revert", async () => {
      expect(
        pool.connect(alice).withdraw()
      ).to.be.revertedWith("No Deposits");
    });
    it("WHEN reward without deposits THEN revert", async () => {
      await expect(
        pool.connect(owner).depositReward({ from: owner.address, value: rewardAmount })        
      ).to.be.revertedWith("No Deposits");
    });
    it("WHEN alice rewards THEN revert", async () => {
      await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      await expect(
        pool.connect(alice).depositReward({ from: alice.address, value: rewardAmount })
      ).to.be.reverted;
    });
    it("WHEN bob added then removed from team THEN depositReward should revert", async () => {
      let tx1 = await pool.connect(owner).addTeam(bob.address);
      expect(tx1).to.emit(pool, "AddTeam").withArgs(bob.address);

      let tx2 = await pool.connect(owner).removeTeam(bob.address);
      expect(tx2).to.emit(pool, "RemoveTeam").withArgs(bob.address);

      // await pool.connect(alice).deposit({ from: alice.address, value: depositAmountAlice });
      // await expect(
      //   pool.connect(bob).depositReward({ from: bob.address, value: rewardAmount })
      // ).to.be.reverted;
    });
    it("WHEN bob added to team by alice THEN revert", async () => {
      await expect(
        pool.connect(alice).addTeam(bob.address)
      ).to.be.reverted;
    });
    it("WHEN bob removed from team by alice THEN revert", async () => {
      let tx1 = await pool.connect(owner).addTeam(bob.address);
      expect(tx1).to.emit(pool, "AddTeam").withArgs(bob.address);

      await expect(
        pool.connect(alice).removeTeam(bob.address)
      ).to.be.reverted;
    });
  });
});
