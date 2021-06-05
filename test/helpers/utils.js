
async function shouldThrow(promise) {
    try {
        await promise
        assert(true) // Why is this true assertion here? Shouldn't it be in the "catch" block?
    } catch (e) {
        return;
    }
    assert(false, "the contract did not throw")
}

module.exports = {
    shouldThrow,
};