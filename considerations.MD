- should I have a standalone 'mint' function even though I do not plan on utilising it beyond the constructor function?
- if I have a standalone 'mint' function, do I need to set a contract owner, or is it enough to set the mint function as 'internal' or even 'private' in order to prevent a malicious actor from minting additional tokens?
- are there any implications of identifying the return values from functions such as totalSupply() ? e.g. returns(uint) vs returns(uint totalSupply)? Could this cause trouble to dApps working with the returned value?
- Do I need to declare EVENTS again in the main (Steve) contract separately even though I'm inheritting from an interface that has the full event declaration?
- Burn function: Is it OK to simply reduce the owner balance and the total supply without initiating a transfer to the '0' address?

Todo: