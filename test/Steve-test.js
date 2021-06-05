
// Using expect.js assertion library via Mocha

const Steve = artifacts.require('Steve')
const utils = require('./helpers/utils')

contract("Steve Token", (accounts) => {
    let     [alice, bob]        = accounts
    const   approvalAmount      = BigInt('1000000000000000000')         // 1 token with 18 decimals, within Alice's balance
    let     contractInstance
    const   exceedsAllowance    = approvalAmount + 1n                   // larger than allowance, within Alice's balance
    const   initialMint         = BigInt('1000000000000000000000000')   // 1 million tokens with 18 decimals
    const   maximumTransfer     = initialMint                           // '1' above Alice's balance
    const   overspendAmount     = BigInt(maximumTransfer) + 1n          
    const   tokenName           = 'Steve Token'
    const   tokenSymbol         = 'STEVE'
    const   transferAmount      = BigInt('1000000000000000000')         // 1 token with 18 decimals, within Alice's balance
    let     zeroAddress         = 0

    beforeEach(async () => {
        contractInstance = await Steve.new(tokenName, tokenSymbol, initialMint)
    })

    it(`should get successfully deployed`, async () => {
        const deployerBalance = await contractInstance.balanceOf(alice)
        expect(deployerBalance.toString()).to.equal(initialMint.toString())
    })

    it(`should be able to transfer tokens`, async () => {
        await contractInstance.transfer(bob, transferAmount)
        const newBobBalance = await contractInstance.balanceOf(bob)
        
        // Tests
        expect(newBobBalance.toString()).to.equal(transferAmount.toString())
    })

    it(`should deduct transfer amount from sender's balance`, async () => {
        const initialAliceBalance   = await contractInstance.balanceOf(alice)
        await contractInstance.transfer(bob, transferAmount)
        const newAliceBalance       = await contractInstance.balanceOf(alice)
        
        // Tests
        expect(BigInt(newAliceBalance)).to.equal(BigInt(initialAliceBalance) - transferAmount)
    })

    it(`should not allow transfers to '0' address`, async () => {
        const aliceBalance  = await contractInstance.balanceOf(alice)
        const invalidAction = contractInstance.transfer('0', transferAmount)
        
        // Sanity checks
        // Alice has tokens to be transferred
        expect(BigInt(aliceBalance)).to.equal(BigInt('1000000000000000000000000'))

        // Test
        utils.shouldThrow(invalidAction)
    })

    it(`should not allow overspending own balance`, async () => {
        const invalidAction = contractInstance.transfer(bob, overspendAmount, { from: alice })

        // test
        utils.shouldThrow(invalidAction)
    })

    it(`should be able to give allowance to a spender`, async () => {
        const initialAllowance  = await contractInstance.allowance(alice, bob)
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        const finalAllowance    = await contractInstance.allowance(alice, bob)
        
        // Sanity checks
        expect(initialAllowance.toString()).to.equal('0')
        
        // Tests
        expect(finalAllowance.toString()).to.equal(approvalAmount.toString())
    })
    
    it(`should allow a spender to spend on owner's behalf given sufficient allowance`, async () => {
        const initialBobBalance = await contractInstance.balanceOf(bob)
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        // Bob transfers 1 token from Alice to himself
        await contractInstance.transferFrom(alice, bob, transferAmount, { from: bob })
        const finalBobBalance   = await contractInstance.balanceOf(bob)
        
        // Sanity checks
        expect(initialBobBalance.toString()).to.equal('0')
        
        // Tests
        expect(finalBobBalance.toString()).to.equal(transferAmount.toString())
    })
    
    it(`should decrease allowance after spender's spending`, async () => {
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        // Bob transfers 1 token from Alice to himself
        await contractInstance.transferFrom(alice, bob, transferAmount, { from: bob })
        const finalAllowance = await contractInstance.allowance(alice, bob)
        
        // Tests
        expect(finalAllowance.toString()).to.equal('0')
    })
    
    it(`should not allow a spender to exceed owner's allowance`, async () => {
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        const invalidAction = contractInstance.transferFrom(alice, bob, overspendAmount, { from: bob })
        
        // Test
        utils.shouldThrow(invalidAction)
    })
    
    it(`should not allow spender to overspend owner's balance`, async () => {
        const largeApproval = BigInt(maximumTransfer) + 1n
        await contractInstance.approve(bob, largeApproval, { from: alice })
        const invalidAction = contractInstance.transferFrom(alice, bob, overspendAmount, { from: bob })

        // Sanity check
        // Compare largeApproval with overspendAmount to check that there's sufficient allowance?

        // Test
        utils.shouldThrow(invalidAction)
    })
})