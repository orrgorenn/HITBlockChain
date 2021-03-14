App = {
    web3Provider: null,
    contracts: {},
    loading: false,
    numOfCandidates: 0,
    hasVoted: false,
    authorized: false,

    init: function () {
        console.log("App initialized...");
        return App.initWeb3();
    },

    initWeb3: async function () {
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            web3.eth.defaultAccount = web3.eth.accounts[0];
            try {
                // Request account access if needed
                await ethereum.enable();
            } catch (error) {
                console.log(error);
            }
        } else if (typeof web3 !== "undefined") {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider(
                "http://localhost:7545"
            );
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("Election.json", function (Election) {
            App.contracts.Election = TruffleContract(Election);
            App.contracts.Election.setProvider(window.web3.currentProvider);
            App.contracts.Election.deployed().then(function (Election) {
                console.log("Election Address:", Election.address);
            });
        }).done(function () {
            return App.render();
        });
    },

    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;

        // Load account data
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        App.contracts.Election.deployed()
            .then(function (Election) {
                ElectionInstance = Election;
                return ElectionInstance.voters(App.account);
            })
            .then(function (_voter) {
                if (_voter.voted) {
                    App.hasVoted = true;
                }
                if (_voter.authorized) {
                    App.authorized = true;
                }
                return ElectionInstance.getNumOfCandidates();
            })
            .then(function (_numOfCandidates) {
                if (_numOfCandidates != 0) {
                    for (var i = 0; i < _numOfCandidates; i++) {
                        // gets candidates and displays them
                        ElectionInstance.candidates(i).then(function (data) {
                            $("#candidate-box").append(
                                `<div>
                                    <strong>${data[0]}</strong>
                                    <br />
                                `
                            );

                            if (!App.hasVoted) {
                                $("#candidate-box").append(
                                    '<button id="vote" class="btn btn-warning">Vote</button></div>'
                                );
                            }
                        });
                    }
                }
            });
    },

    addCandidate: function (fullName) {
        App.contracts.Election.deployed().then(function (Election) {
            ElectionInstance = Election;
            return ElectionInstance.addCandidate(fullName);
        });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
