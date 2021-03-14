var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
    it("initilized with 1 candidate", function () {
        return Election.deployed()
            .then(function (instance) {
                return instance.getNumOfCandidates();
            })
            .then(function (count) {
                assert.equal(count, 1);
            });
    });
});
