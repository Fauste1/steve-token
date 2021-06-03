const Steve = artifacts.require('Steve')

contract("Steve Token", (accounts) => {
    let     [alice, bob]    = accounts;
    const   initialMint     = '1000000000000000000000000'   // 1 million tokens with 18 decimals
    const   tokenName       = 'Steve Token'
    const   tokenSymbol     = 'STEVE'

    it(`should get successfully deployed`, async () => {
        contractInstance = await Steve.new(tokenName, tokenSymbol, BigInt(initialMint))

        const deployerBalance = await contractInstance.balanceOf(alice)
        expect(deployerBalance.toString()).to.equal(initialMint)
    })
})