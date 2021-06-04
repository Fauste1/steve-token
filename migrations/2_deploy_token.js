const Steve = artifacts.require("Steve")

module.exports = function (deployer) {
    const initialMint = BigInt('10000000000000000000000000') // 10 million, 18 decimals
    // deployer.deploy(Steve, "Steve Token", "STEVE", initialMint);
    deployer.deploy(Steve, 'Steve Token', 'STEVE', initialMint);
};