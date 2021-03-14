var Election = artifacts.require("./Election.sol");
var GorenCoinToken = artifacts.require("./GorenCoinToken.sol");

module.exports = function (deployer) {
    deployer.deploy(GorenCoinToken, 100000).then(function () {
        // Token price is 0.001 ETH
        var tokenPrice = 1000000000000000;
        return deployer.deploy(Election, GorenCoinToken.address, tokenPrice);
    });
};
