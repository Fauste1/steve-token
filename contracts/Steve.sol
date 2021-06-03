// solidity version & licence to be adjusted before pushing final code
// How to properly credit openzeppelin for the contract code?

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './IERC20.sol';


/**
 * @dev Implementation of the {IERC20} interface.
 *
 * The contract is following general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract Steve is IERC20, IERC20Metadata {

  mapping (address => uint256) private _balances;
  mapping (address => mapping (address => uint256)) private _allowed;
  uint256 private _totalSupply;

  string private _name;
  string private _symbol;
  uint8 private _decimals;

  constructor (string memory name_, string memory symbol_, uint256 initialSupply_) {
      _name = name_;
      _symbol = symbol_;
      _decimals = 18;
      _mint(msg.sender, initialSupply_);
  }

  /**
  * @dev Returns the name of the token
  */
  function name() public view virtual override returns (string memory) {
      return _name;
  }

  /**
  * @dev Returns the symbol of the token
  */
  function symbol() public view virtual override returns (string memory) {
      return _symbol;
  }

  /**
  * @dev Returns the number of decimal places of the token
  */
  function decimals() public view virtual override returns (uint8) {
      return _decimals;
  }

  /**
  * @dev Returns the amount of tokens in existence.
  */
  function totalSupply() public view virtual override returns (uint256) {
      return _totalSupply;
  }

  /**
  * @dev Returns the current token balance of a specified `owner` address.
  */
  function balanceOf(address owner) public view virtual override returns (uint256 balance) {
      return _balances[owner];
  }

  /**
  * @dev Moves `value` tokens from the caller's account to `to` account.
  *
  * Returns a boolean value indicating whether the operation succeeded.
  *
  * Emits a {Transfer} event.
  */
  function transfer(address to, uint256 value) public virtual override returns (bool success) {
      _transfer(msg.sender, to, value);
      return true;
  }
  
  /**
  * @dev Moves `value` tokens from `from` address to `to` address using the
  * allowance mechanism. `value` is then deducted from the caller's
  * allowance.
  *
  * Returns a boolean value indicating whether the operation succeeded.
  *
  * Emits a {Transfer} event.
  */
  function transferFrom(address from, address to, uint256 value) public virtual override returns (bool success) {
      uint256 _currentAllowance = _allowed[from][msg.sender];
      require(_currentAllowance >= value, "STEVE: Transfer amount exceeds allowance");
      
      _transfer(from, to, value);
      
      // This is implied valid based on the require earlier in the function
      unchecked {
          _approve(from, msg.sender, _currentAllowance - value);
      }

      return true;
  }
  
  /**
  * @dev Sets `value` as the allowance of `spender` over the caller's tokens.
  *
  * Returns a boolean value indicating whether the operation succeeded.
  *
  * IMPORTANT: This method is subject to a known attack vector as described in
  * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
  *
  * Emits an {Approval} event.
  */
  function approve(address spender, uint256 value) public virtual override returns (bool success) {
      _approve(msg.sender, spender, value);
      return true;
  }

  /**
  * @dev Returns the remaining number of tokens that `spender` will be
  * allowed to spend on behalf of `owner` through {transferFrom}. This is
  * zero by default.
  *
  * This value changes when {approve} or {transferFrom} are called.
  */
  function allowance(address owner, address spender) public virtual override view returns (uint256 remaining) {
      return _allowed[owner][spender];
  }

  /**
  * @dev Atomically increases allowance for a particular spender of a msg.sender account
  */
  function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool success) {
      // Might want to consider reverting if msg.sender == spender (would this save gas?)
      _approve(msg.sender, spender, _allowed[msg.sender][spender] + addedValue);
      return true;
  }

  /**
  * @dev Atomically decreases allowance for a particular spender of a msg.sender account
  */
  function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool success) {
      _approve(msg.sender, spender, _allowed[msg.sender][spender] - subtractedValue);
      return true;
  }

  /**
  * @dev Internal function to handle transfers
  * 
  * Moves `value` tokens from `from` address to `to` address using the
  * allowance mechanism. `value` is then deducted from the caller's
  * allowance.
  *
  * Returns a boolean value indicating whether the operation succeeded.
  *
  * Emits a {Transfer} event.
  */
  function _transfer(address _from, address _to, uint _value) internal virtual {
      require(_from != address(0), "STEVE: transfer from the zero address");
      require(_to != address(0), "STEVE: transfer to the zero address");

      uint256 senderBalance = _balances[_from];
      require(senderBalance >= _value, "STEVE: transfer value exceeds balance");
      unchecked {
          _balances[_from] -= _value;
      }
      _balances[_to] += _value;

      emit Transfer(_from, _to, _value);
  }

  
  /**
  * @dev Internal function to handle allowances adjustment
  * 
  * Sets `value` as the allowance of `spender` over the caller's tokens.
  *
  * Returns a boolean value indicating whether the operation succeeded.
  *
  * IMPORTANT: This method is subject to a known attack vector as described in
  * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
  *
  * Emits an {Approval} event.
  */
  function _approve(address _owner, address _spender, uint _value) internal virtual {
      require(_owner != address(0), "STEVE: approve from the zero address");
      require(_spender != address(0), "STEVE: approve to the zero address");
      
      _allowed[_owner][_spender] = _value;
      emit Approval(_owner, _spender, _value);
  }

  /**
  * @dev Internal function to mint a specified `_amount` of new tokens 
  * and transfer them to a `_mintRecipient` account. 
  * This function increases the total token supply.
  * 
  * Emits a {Transfer} event.
  */
  function _mint(address _mintRecipient, uint256 _amount) internal virtual {
      require(_mintRecipient != address(0), "STEVE: mint to the zero address");

      _totalSupply += _amount;
      _balances[_mintRecipient] += _amount;
      emit Transfer(address(0), _mintRecipient, _amount);
  }

  /**
  * @dev Internal function to burn a specified `_amount` of tokens of a given `_owner` account. 
  * This function decreases the total token supply.
  *
  * Emits a {Transfer} event.
  */
  function _burn(address _owner, uint256 _amount) internal virtual {
      require(_owner != address(0), "STEVE: burn from the zero address");

      uint256 accountBalance = _balances[_owner];
      require(accountBalance >= _amount, "STEVE: burn amount exceeds balance");
      unchecked {
          _balances[_owner] = accountBalance - _amount;
      }
      _totalSupply -= _amount;

      emit Transfer(_owner, address(0), _amount);
  }

}