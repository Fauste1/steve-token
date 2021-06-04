const Steve = artifacts.require('Steve')

contract("Steve Token", (accounts) => {
    let     [alice, bob]    = accounts
    const   approvalAmount  = BigInt('1000000000000000000') // 1 token with 18 decimals
    let     contractInstance
    const   initialMint     = BigInt('1000000000000000000000000')   // 1 million tokens with 18 decimals
    const   tokenName       = 'Steve Token'
    const   tokenSymbol     = 'STEVE'
    const   transferAmount  = BigInt('1000000000000000000') // 1 token with 18 decimals
    let     zeroAddress     = 0

    beforeEach(async () => {
        contractInstance = await Steve.new(tokenName, tokenSymbol, initialMint)
    })

    it(`should get successfully deployed`, async () => {
        const deployerBalance = await contractInstance.balanceOf(alice)
        expect(deployerBalance.toString()).to.equal(initialMint.toString())
    })

    it(`should be able to transfer tokens`, async () => {
        const initialAliceBalance   = await contractInstance.balanceOf(alice)
        const initialBobBalance     = await contractInstance.balanceOf(bob)
        await contractInstance.transfer(bob, transferAmount)
        const newAliceBalance       = await contractInstance.balanceOf(alice)
        const newBobBalance         = await contractInstance.balanceOf(bob)
        
        // Sanity checks
        expect(initialAliceBalance.toString()).to.equal(initialMint.toString())
        expect(initialBobBalance.toString()).to.equal('0')
        
        // Tests
        expect(BigInt(newAliceBalance)).to.equal(BigInt(initialAliceBalance) - transferAmount)
        expect(BigInt(newBobBalance)).to.equal(BigInt(initialBobBalance) + transferAmount)
        expect(newBobBalance.toString()).to.equal(transferAmount.toString())
    })

    xit(`should not allow transfers to '0' address`, async () => {
        await contractInstance.transfer('0', transferAmount) // should throw
    })

    xit(`should not allow overspending user's balance`, async () => {
        // should throw on attempt to spend balance +1
    })

    it(`should be able to approve a 3rd party to spend tokens`, async () => {
        const initialAllowance  = await contractInstance.allowance(alice, bob)
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        const finalAllowance    = await contractInstance.allowance(alice, bob)
        
        // Sanity checks
        expect(initialAllowance.toString()).to.equal('0')
        
        // Tests
        expect(finalAllowance.toString()).to.equal(approvalAmount.toString())
    })
    
    it(`should allow a 3rd party to spend on user's behalf given sufficient allowance`, async () => {
        const initialBobBalance     = await contractInstance.balanceOf(bob)
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        // Bob transfers 1 token from Alice to himself
        await contractInstance.transferFrom(alice, bob, transferAmount, { from: bob })
        const finalBobBalance       = await contractInstance.balanceOf(bob)
        
        // Sanity checks
        expect(initialBobBalance.toString()).to.equal('0')
        
        // Tests
        expect(finalBobBalance.toString()).to.equal(transferAmount.toString())
    })
    
    it(`should decrease allowance after spender's spending`, async () => {
        const initialAllowance      = await contractInstance.allowance(alice, bob)
        // Alice approves Bob to spend 1 token on her behalf
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        const increasedAllowance    = await contractInstance.allowance(alice, bob)
        // Bob transfers 1 token from Alice to himself
        await contractInstance.transferFrom(alice, bob, transferAmount, { from: bob })
        const finalAllowance        = await contractInstance.allowance(alice, bob)
        
        // Sanity checks
        expect(initialAllowance.toString()).to.equal('0')
        expect(increasedAllowance.toString()).to.equal(approvalAmount.toString())
        
        // Tests
        expect(finalAllowance.toString()).to.equal('0')
    })
    
    xit(`should not allow a spender to exceed owner's allowance`, async () => {
        const overspendAmount = BigInt(transferAmount) + 1n
        await contractInstance.approve(bob, approvalAmount, { from: alice })
        
        
        // Sanity check
        expect(transferAmount.toString()).to.equal(approvalAmount.toString()) // change this to compare overspendAmount with approvalAmount?
        
        // Test
        await contractInstance.transferFrom(alice, bob, overspendAmount, { from: bob }) // should throw
    })
    
    // Bob should not be able to spend more of Alice's tokens than what's Alice's total balance
    xit(`should not allow spender to overspend owner's balance`, async () => {
        const largeApproval = BigInt(initialMint) + 1n
        const largeTransfer = BigInt(initialMint) + 1n
        const aliceBalance  = contractInstance.balanceOf(alice)

        await contractInstance.approve(bob, largeApproval, { from: alice })

        // Sanity check
        // expect largeApproval to be greater than alice's total balance

        // Test
        await contractInstance.transferFrom(alice, bob, largeTransfer, { from: bob }) // should throw

    })
    
    xit(`should not allow further minting`, async () => {
        await contractInstance._mint(alice, '1', { from: alice }) // should throw
    })
})