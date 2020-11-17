const { scripts, ConfigManager } = require('@openzeppelin/cli');
const { add, push, create } = scripts;

const WrappedShift = artifacts.require("WrappedShift");

module.exports = function(deployer) {
  const initialCap = web3.utils.toBN("14300000000000000000000000");
  deployer.deploy(WrappedShift, initialCap);
};