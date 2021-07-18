const Donator = artifacts.require("Donator");

module.exports = function(deployer) {
  deployer.deploy(Donator);
};
