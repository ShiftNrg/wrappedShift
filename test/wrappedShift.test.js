const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { shouldBehaveLikeERC20, shouldBehaveLikeERC20Transfer } = require('./oz-modified/ERC20.behavior');

const WrappedShift = artifacts.require("WrappedShift");

contract('WrappedShift', (accounts) => {
  const DEFAULT_ADMIN_ROLE  = accounts[0];
  const BURNER_ROLE         = accounts[1];
  const CAPPED_ROLE         = accounts[2];
  const MINTER_ROLE         = accounts[3];
  const PAUSER_ROLE         = accounts[4];
  const TOKEN_HOLDER_1      = accounts[5];
  const TOKEN_HOLDER_2      = accounts[6];
  const TOKEN_HOLDER_3      = accounts[7];
  const RECEIVER            = accounts[8];
  const PREVIOUS_ROLE       = accounts[8];

  const zero            = web3.utils.toBN('0');
  const initialTokenCap = web3.utils.toBN("14300000000000000000000000"); // 14,300,000
  const testAmount      = web3.utils.toBN("10000000000000000000"); // 10

  const DEFAULT_ADMIN_ROLE_SHA  = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const BURNER_ROLE_SHA         = web3.utils.soliditySha3('BURNER_ROLE');
  const CAPPED_ROLE_SHA         = web3.utils.soliditySha3('CAPPED_ROLE');
  const MINTER_ROLE_SHA         = web3.utils.soliditySha3('MINTER_ROLE');
  const PAUSER_ROLE_SHA         = web3.utils.soliditySha3('PAUSER_ROLE');

  let wrappedShiftInstance;
  beforeEach(async () => {
    wrappedShiftInstance = await WrappedShift.deployed();
  });

  describe('ERC20 Initial Deployment', () => {
    it('should instantiate the ERC20 token correctly', async () => {
      const name            = await wrappedShiftInstance.name();
      const symbol          = await wrappedShiftInstance.symbol();
      const decimals        = await wrappedShiftInstance.decimals();
      const totalSupply     = await wrappedShiftInstance.totalSupply();
      const cap             = await wrappedShiftInstance.cap();
      const isPaused        = await wrappedShiftInstance.paused();
      const burningEnabled  = await wrappedShiftInstance.burningEnabled();
  
      assert.equal(name, 'Wrapped Shift', 'Name does not match');
      assert.equal(symbol, 'wSHIFT', 'Symbol does not match');
      assert.equal(decimals, 18, 'Decimals does not match');
      assert.equal(zero.toString(), totalSupply.toString(), 'Token supply is incorrect');
      assert.equal(initialTokenCap.toString(), cap.toString(), 'Token cap is incorrect');
      assert.equal(isPaused, false, 'token should be not paused');
      assert.equal(burningEnabled, false, 'token should be not burnable');
    });

    it('deployer has default admin role', async () => {
      expect(await wrappedShiftInstance.hasRole(DEFAULT_ADMIN_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });

    it('deployer has burner role', async () => {
      expect(await wrappedShiftInstance.hasRole(BURNER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });

    it('deployer has capped role', async () => {
      expect(await wrappedShiftInstance.hasRole(CAPPED_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });

    it('deployer has minter role', async () => {
      expect(await wrappedShiftInstance.hasRole(MINTER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });

    it('deployer has pauser role', async () => {
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });

    it('default admin role\'s admin is itself', async () => {
      expect(await wrappedShiftInstance.getRoleAdmin(DEFAULT_ADMIN_ROLE_SHA)).to.equal(DEFAULT_ADMIN_ROLE_SHA);
    });
  });

  /** Access Control Tests */
  describe('Access Controls', () => {
    // Admin Role Tests
    it('deployer has default admin role', async () => {
      expect(await wrappedShiftInstance.hasRole(DEFAULT_ADMIN_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });
    it('default admin role\'s admin is itself', async () => {
      expect(await wrappedShiftInstance.getRoleAdmin(DEFAULT_ADMIN_ROLE_SHA)).to.equal(DEFAULT_ADMIN_ROLE_SHA);
    });
    it('only admin role can grant role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(DEFAULT_ADMIN_ROLE_SHA, TOKEN_HOLDER_2, { from: TOKEN_HOLDER_1 }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('admin grants burner role', async () => {
      expect(await wrappedShiftInstance.hasRole(BURNER_ROLE_SHA, BURNER_ROLE)).to.equal(false);
      await wrappedShiftInstance.grantRole(BURNER_ROLE_SHA, BURNER_ROLE);
      expect(await wrappedShiftInstance.hasRole(BURNER_ROLE_SHA, BURNER_ROLE)).to.equal(true);
    });
    it('admin grants capped role', async () => {
      expect(await wrappedShiftInstance.hasRole(CAPPED_ROLE_SHA, CAPPED_ROLE)).to.equal(false);
      await wrappedShiftInstance.grantRole(CAPPED_ROLE_SHA, CAPPED_ROLE);
      expect(await wrappedShiftInstance.hasRole(CAPPED_ROLE_SHA, CAPPED_ROLE)).to.equal(true);
    });
    it('admin grants minter role', async () => {
      expect(await wrappedShiftInstance.hasRole(MINTER_ROLE_SHA, MINTER_ROLE)).to.equal(false);
      await wrappedShiftInstance.grantRole(MINTER_ROLE_SHA, MINTER_ROLE);
      expect(await wrappedShiftInstance.hasRole(MINTER_ROLE_SHA, MINTER_ROLE)).to.equal(true);
    });
    it('admin grants pauser role', async () => {
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, PAUSER_ROLE)).to.equal(false);
      await wrappedShiftInstance.grantRole(PAUSER_ROLE_SHA, PAUSER_ROLE);
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, PAUSER_ROLE)).to.equal(true);
    });
    it('admin grants pauser role and revokes', async () => {
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, PREVIOUS_ROLE)).to.equal(false);
      await wrappedShiftInstance.grantRole(PAUSER_ROLE_SHA, PREVIOUS_ROLE);
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, PREVIOUS_ROLE)).to.equal(true);
      await wrappedShiftInstance.revokeRole(PAUSER_ROLE_SHA, PREVIOUS_ROLE);
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, PREVIOUS_ROLE)).to.equal(false);
    });

    // Burner Role Tests
    it('deployer has burner role', async () => {
      expect(await wrappedShiftInstance.hasRole(BURNER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });
    it('only admin role can grant burner role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(BURNER_ROLE_SHA, TOKEN_HOLDER_2, { from: TOKEN_HOLDER_1 }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only admin role can grant burner role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(BURNER_ROLE_SHA, TOKEN_HOLDER_2, { from: BURNER_ROLE }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only burner role can enable burning', async () => {
      await expectRevert(wrappedShiftInstance.enableBurn({ from: PREVIOUS_ROLE }),
        'must have burner role to enable burn',
      );
    });
    it('only burner role can disable burning', async () => {
      await wrappedShiftInstance.enableBurn({ from: BURNER_ROLE });
      await expectRevert(wrappedShiftInstance.disableBurn({ from: PREVIOUS_ROLE }),
        'must have burner role to disable burn',
      );
      await wrappedShiftInstance.disableBurn({ from: BURNER_ROLE });
    });

    // Capped Role Tests
    it('deployer has capped role', async () => {
      expect(await wrappedShiftInstance.hasRole(CAPPED_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });
    it('only admin role can grant capped role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(CAPPED_ROLE_SHA, TOKEN_HOLDER_2, { from: TOKEN_HOLDER_1 }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only admin role can grant capped role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(CAPPED_ROLE_SHA, TOKEN_HOLDER_2, { from: CAPPED_ROLE }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only capped role can set cap', async () => {
      await expectRevert(wrappedShiftInstance.setCap(initialTokenCap.add(testAmount), { from: PREVIOUS_ROLE }),
        'must have capped role to set cap',
      );
    });

    // Minter Role Tests
    it('deployer has minter role', async () => {
      expect(await wrappedShiftInstance.hasRole(MINTER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });
    it('only admin role can grant minter role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(MINTER_ROLE_SHA, TOKEN_HOLDER_2, { from: TOKEN_HOLDER_1 }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only admin role can grant minter role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(MINTER_ROLE_SHA, TOKEN_HOLDER_2, { from: MINTER_ROLE }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only minter role can mint', async () => {
      await expectRevert(wrappedShiftInstance.mint(TOKEN_HOLDER_3, testAmount, { from: PREVIOUS_ROLE }),
        'must have minter role to mint',
      );
    });
    it('only minter role can mint', async () => {
      await expectRevert(wrappedShiftInstance.multiMint([TOKEN_HOLDER_1, TOKEN_HOLDER_2], [testAmount, testAmount], { from: PREVIOUS_ROLE }),
        'must have minter role to mint',
      );
    });

    // Pauser Role Tests
    it('deployer has pauser role', async () => {
      expect(await wrappedShiftInstance.hasRole(PAUSER_ROLE_SHA, DEFAULT_ADMIN_ROLE)).to.equal(true);
    });
    it('only admin role can grant pauser role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(PAUSER_ROLE_SHA, TOKEN_HOLDER_2, { from: TOKEN_HOLDER_1 }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only admin role can grant pauser role', async () => {
      await expectRevert(wrappedShiftInstance.grantRole(PAUSER_ROLE_SHA, TOKEN_HOLDER_2, { from: PAUSER_ROLE }),
        'AccessControl: sender must be an admin to grant',
      );
    });
    it('only pauser role can pause', async () => {
      await expectRevert(wrappedShiftInstance.pause({ from: PREVIOUS_ROLE }),
        'must have pauser role to pause',
      );
    });
    it('only pauser role can pause', async () => {
      expect(await wrappedShiftInstance.paused()).to.equal(false);
      wrappedShiftInstance.pause({ from: PAUSER_ROLE })
      expect(await wrappedShiftInstance.paused()).to.equal(true);
      wrappedShiftInstance.unpause({ from: PAUSER_ROLE })
    });
    it('only pauser role can unpause', async () => {
      await expectRevert(wrappedShiftInstance.unpause({ from: PREVIOUS_ROLE }),
        'must have pauser role to unpause',
      );
    });
  });

  /** Capped Supply Tests */
  describe('Capped Supply', () => {
    it('non capped role cannot setCap', async () => {
      await expectRevert(wrappedShiftInstance.setCap(initialTokenCap.add(testAmount), { from: TOKEN_HOLDER_1 }),
        'must have capped role to set cap',
      );
    });

    it('cannot set cap lower than previous cap', async () => {
      await expectRevert(wrappedShiftInstance.setCap(initialTokenCap.sub(testAmount), { from: DEFAULT_ADMIN_ROLE }),
        'new cap must be > previous',
      );
    });

    it('increases cap successfully', async () => {
      await wrappedShiftInstance.setCap(initialTokenCap.add(testAmount), { from: DEFAULT_ADMIN_ROLE });
      
      expect(await wrappedShiftInstance.cap()).to.be.bignumber.equal(initialTokenCap.add(testAmount));
    });
  });

  /** Burnable Tests */
  describe('Burning', () => {
    const amount = new BN('42');

    let beforeAmount;
    beforeEach(async () => {
      await wrappedShiftInstance.mint(TOKEN_HOLDER_1, amount);
      beforeAmount = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1);
    });

    it('enable burning', async () => {
      await wrappedShiftInstance.enableBurn();
    });

    it('allows to burn when unpaused', async () => {
      await wrappedShiftInstance.burn(amount, { from: TOKEN_HOLDER_1 });

      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(beforeAmount.sub(amount));
    });

    it('allows to burn when paused and then unpaused', async () => {
      await wrappedShiftInstance.pause();
      await wrappedShiftInstance.unpause();

      await wrappedShiftInstance.burn(amount, { from: TOKEN_HOLDER_1 });

      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(beforeAmount.sub(amount));
    });

    it('reverts when trying to burn when paused', async () => {
      await wrappedShiftInstance.pause();

      await expectRevert(wrappedShiftInstance.burn(amount, { from: TOKEN_HOLDER_1 }),
        'ERC20Pausable: token transfer while paused',
      );

      await wrappedShiftInstance.unpause();
    });

    it('reverts when trying to burn when burning is not enabled', async () => {
      await wrappedShiftInstance.disableBurn();

      await expectRevert(wrappedShiftInstance.burn(amount, { from: TOKEN_HOLDER_1 }),
        'cannot burn tokens; burning disabled',
      );
    });
  });

  /** Mintable Tests */
  describe('Minting', () => {
    const amount = new BN('42');

    it('allows to mint when unpaused', async () => {
      const beforeAmount = await wrappedShiftInstance.balanceOf(RECEIVER);
      await wrappedShiftInstance.mint(RECEIVER, amount);

      expect(await wrappedShiftInstance.balanceOf(RECEIVER)).to.be.bignumber.equal(amount.add(beforeAmount));
    });
    it('allows to mint when unpaused', async () => {
      const beforeAmount1 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1);
      const beforeAmount2 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_2);
      const beforeAmount3 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_3);
      await wrappedShiftInstance.multiMint([TOKEN_HOLDER_1, TOKEN_HOLDER_2, TOKEN_HOLDER_3], [testAmount, testAmount, testAmount]),

      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(testAmount.add(beforeAmount1));
      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_2)).to.be.bignumber.equal(testAmount.add(beforeAmount2));
      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_3)).to.be.bignumber.equal(testAmount.add(beforeAmount3));
    });

    it('allows to mint when paused and then unpaused', async () => {
      await wrappedShiftInstance.pause();
      await wrappedShiftInstance.unpause();

      const beforeAmount = await wrappedShiftInstance.balanceOf(RECEIVER);
      await wrappedShiftInstance.mint(RECEIVER, amount);

      expect(await wrappedShiftInstance.balanceOf(RECEIVER)).to.be.bignumber.equal(amount.add(beforeAmount));
    });
    it('allows to multiMint when paused and then unpaused', async () => {
      await wrappedShiftInstance.pause();
      await wrappedShiftInstance.unpause();

      const beforeAmount1 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1);
      const beforeAmount2 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_2);
      const beforeAmount3 = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_3);
      await wrappedShiftInstance.multiMint([TOKEN_HOLDER_1, TOKEN_HOLDER_2, TOKEN_HOLDER_3], [testAmount, testAmount, testAmount]),

      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(testAmount.add(beforeAmount1));
      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_2)).to.be.bignumber.equal(testAmount.add(beforeAmount2));
      expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_3)).to.be.bignumber.equal(testAmount.add(beforeAmount3));
    });

    it('reverts when trying to mint when paused', async () => {
      await wrappedShiftInstance.pause();

      await expectRevert(wrappedShiftInstance.mint(RECEIVER, amount),
        'ERC20Pausable: token transfer while paused',
      );

      await wrappedShiftInstance.unpause();
    });
    it('reverts when trying to multiMint when paused', async () => {
      await wrappedShiftInstance.pause();

      await expectRevert(wrappedShiftInstance.multiMint([TOKEN_HOLDER_1, TOKEN_HOLDER_2, TOKEN_HOLDER_3], [testAmount, testAmount, testAmount]),
        'ERC20Pausable: token transfer while paused',
      );

      await wrappedShiftInstance.unpause();
    });

    it('cannot mint mistmatched array lengths', async () => {
      await expectRevert(wrappedShiftInstance.multiMint([TOKEN_HOLDER_1], [testAmount, testAmount], { from: MINTER_ROLE }),
        'array lengths are not equal',
      );
    });
    it('2: cannot mint mistmatched array lengths', async () => {
      await expectRevert(wrappedShiftInstance.multiMint([TOKEN_HOLDER_1, TOKEN_HOLDER_2], [testAmount], { from: MINTER_ROLE }),
        'array lengths are not equal',
      );
    });

    it('cannot mint over cap', async () => {
      await expectRevert(wrappedShiftInstance.mint(TOKEN_HOLDER_1, initialTokenCap.add(testAmount), { from: MINTER_ROLE }),
        'ERC20Capped: cap exceeded',
      );
    });
    it('can mint more than previous cap after new cap is set', async () => {

      const currentSupply = await wrappedShiftInstance.totalSupply();

      await wrappedShiftInstance.setCap(initialTokenCap.add(testAmount).add(testAmount), { from: DEFAULT_ADMIN_ROLE });

      await wrappedShiftInstance.mint(TOKEN_HOLDER_1, initialTokenCap.sub(currentSupply).add(testAmount).add(testAmount), { from: MINTER_ROLE });

      // increase cap after test for remaining test
      await wrappedShiftInstance.setCap(initialTokenCap.add(testAmount).add(testAmount).add(testAmount).add(testAmount).add(testAmount), { from: DEFAULT_ADMIN_ROLE });
    });
  });

  /** Pauseable Tests */
  describe('Pausing', () => {
    describe('transfer', () => {
      beforeEach(async () => {
        await wrappedShiftInstance.mint(TOKEN_HOLDER_1, testAmount);
      });

      it('allows to transfer when unpaused', async () => {
        const beforeAmountSender = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1);
        const beforeAmountReceiver = await wrappedShiftInstance.balanceOf(RECEIVER);

        await wrappedShiftInstance.transfer(RECEIVER, testAmount, { from: TOKEN_HOLDER_1 });

        expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(beforeAmountSender.sub(testAmount));
        expect(await wrappedShiftInstance.balanceOf(RECEIVER)).to.be.bignumber.equal(beforeAmountReceiver.add(testAmount));
      });

      it('allows to transfer when paused and then unpaused', async () => {
        await wrappedShiftInstance.pause();
        await wrappedShiftInstance.unpause();

        const beforeAmountSender = await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1);
        const beforeAmountReceiver = await wrappedShiftInstance.balanceOf(RECEIVER);

        await wrappedShiftInstance.transfer(RECEIVER, testAmount, { from: TOKEN_HOLDER_1 });

        expect(await wrappedShiftInstance.balanceOf(TOKEN_HOLDER_1)).to.be.bignumber.equal(beforeAmountSender.sub(testAmount));
        expect(await wrappedShiftInstance.balanceOf(RECEIVER)).to.be.bignumber.equal(beforeAmountReceiver.add(testAmount));
      });

      it('reverts when trying to transfer when paused', async () => {
        await wrappedShiftInstance.pause();

        await expectRevert(wrappedShiftInstance.transfer(RECEIVER, testAmount, { from: TOKEN_HOLDER_1 }),
          'ERC20Pausable: token transfer while paused',
        );

        await wrappedShiftInstance.unpause();
      });
    });
  });

  describe(`ERC20 Behaviors`, async () => {
    beforeEach(async function () {
      this.token = await WrappedShift.new(testAmount);
      await this.token.mint(TOKEN_HOLDER_1, testAmount);
    });

    shouldBehaveLikeERC20('ERC20', testAmount, TOKEN_HOLDER_1, RECEIVER, TOKEN_HOLDER_2);
  });
});
