// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract InheritApesMAYC {
	
	// Mapping from Ape Holder address to mapping from tokenId to beneficiary address
	mapping (address => mapping (uint => address)) internal _beneficiaries;
	// Mapping from Ape Holder address to mapping from tokenId to deadline timestamp
	mapping (address => mapping (uint => uint)) internal _deadlines;
	
	// Hardcoded MAYC contract address. using Goerli BetaToken contract address for testing
	address internal _MAYC = 0x3f228cBceC3aD130c45D21664f2C7f5b23130d23;
	//address internal _MAYC = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512; // hardhat
	
	// Hardcoded ApeCoin contract address, using Goerli Mock ERC 20 contract address for testing
	address internal _APECOIN = 0x328507DC29C95c170B56a1b3A758eB7a9E73455c; 
	//address internal _APECOIN = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0; // hardhat
	
	// Harcoded Treasury address, using my wallet to recover the coins for testing
	address internal _TREASURY = 0x9b4CAC0872a084B7F51Cdbc987B048C27f6aB461; // my helper wallet, goerli
	//address internal _TREASURY = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; //  hardhat
	
	
	// The First Ape
	uint MIN_MAYC_ID = 0;
	// The Last Ape
	uint MAX_MAYC_ID = 30006;
	
	// Price of the Inheritance service, Must to be paid using Ape Coin
	uint PRICE = 3 * (10 ** 18);
	uint PRICE_ALL = 10 * (10 ** 18);
	
	// Emitted after successfully register/update/unregister an Ape into the InheritApes service
	event ApprovalApeTransferAfter(uint deadline, address indexed apeHolder, address indexed beneficiary, uint tokenId);
	// Emitted after successfully register/unregister a beneficiary for all Apes owned by an apeHolder
	event ApprovalTransferForAllApesAfter(uint deadline, address indexed apeHolder, address indexed beneficiary);
	
	constructor() {}
	
	// An apeHolder may set a beneficiary as of a deadline
	// An apeHolder may set deadline and/or beneficiary as 0 to cancel a previous register 
	function approveApeTransferAfter(
		uint _deadline, address _beneficiary, uint _tokenId
	) public {
		if (_beneficiaries[msg.sender][_tokenId] == address(0) &&
			_deadlines[msg.sender][_tokenId] == 0) {
			// First time using the service, so sender must to paid PRICE in ApeCoin
				// Get ApeCoin interface
				IERC20 apeCoin = IERC20(_APECOIN);
				// Check the balance of ApeCoin is enough to pay the price for the service
				require(apeCoin.balanceOf(msg.sender) >= PRICE, "Not enough ApeCoin");
				apeCoin.transferFrom(msg.sender, _TREASURY, PRICE);
		}
		// Check tokenId validity
		require(_tokenId >= MIN_MAYC_ID && _tokenId <= MAX_MAYC_ID, "Invalid tokenId");
		// Get the MAYC interface
		IERC721 mayc = IERC721(_MAYC);
		// Get the owner of the tokenId
		address _apeHolder = mayc.ownerOf(_tokenId);
		// Check ownership of tokenId
		require(
			_apeHolder == msg.sender, "Caller is not token owner");
		// The caller is holding MAYC #tokenId, Great!
		
		// Check deadline validity
		require(_deadline > block.timestamp || _deadline == 0, "Deadline must be at future or be 0");
		
		_approveApeTransferAfter(_deadline, _apeHolder, _beneficiary, _tokenId);
	}
	// Internal function to register the Ape beneficiary and deadline. Emit ApprovalApeTransferAfter.
	function _approveApeTransferAfter(
		uint _deadline, address _apeHolder, address _beneficiary, uint _tokenId
	) internal {
		_beneficiaries[_apeHolder][_tokenId] = _beneficiary;
		_deadlines[_apeHolder][_tokenId] = _deadline;
		emit ApprovalApeTransferAfter(_deadline, _apeHolder, _beneficiary, _tokenId);
	}
	
	
	// A beneficiary may claim an Ape after reach the deadline
	// The ApeHolder must hold the tokenId. The ApeHolder must not revoke the approval to the contract
	function claimApe(uint _tokenId) public {
		// Check tokenId validity
		require(_tokenId >= MIN_MAYC_ID && _tokenId <= MAX_MAYC_ID, "Invalid tokenId");
		// Get the MAYC interface
		IERC721 mayc = IERC721(_MAYC);
		// Get the owner of the tokenId
		address _apeHolder = mayc.ownerOf(_tokenId);
		// Get the beneficiary of the tokenId.
		address _beneficiary = _beneficiaries[_apeHolder][_tokenId];
		// Check if caller is the beneficiary setted by the owner of the tokenId
		require(_beneficiary == msg.sender, "Caller is not the beneficiary");	
		// The caller is the beneficiary of MAYC #tokenId, Great!
		
		// Get the deadline
		uint _deadline = _deadlines[_apeHolder][_tokenId];
		// Check whether or not the deadline is at the past
		require(_deadline < block.timestamp && _deadline != 0, "Deadline must be at the past");
		// The deadline has been reached, a true diamondhands holder is now in the APE-Halla,
		// celebrating with OdinApe and ApeThor, this APE is bored no more, Community cries and
		// makes the promise of never forget about its history, the first step will be to fullfill,
		// the wishes of this glorious APE, Initiates their successors into the Community.
		
		// Transfer Ape To a New Holder designated by the glorious APE before goes to the APE-Halla
		mayc.safeTransferFrom(_apeHolder, _beneficiary, _tokenId);
		// Awesome, MAYC #tokenId has been succesfully transferred from the APE-Halla! PLW3!
	}
	
	
	// An apeHolder may set a beneficiary for all their apes as of a deadline
	// An apeHolder may set deadline and/or beneficiary as zero to cancel a previous register
	function approveTransferForAllApesAfter(
		uint _deadline, address _beneficiary
	) public {
		if (_beneficiaries[msg.sender][type(uint256).max] == address(0) &&
			_deadlines[msg.sender][type(uint256).max] == 0) {
			// First time using the service, so sender must to paid PRICE_ALL in ApeCoin
				// Get ApeCoin interface
				IERC20 apeCoin = IERC20(_APECOIN);
				// Check the balance of ApeCoin is enough to pay the price for the service
				require(apeCoin.balanceOf(msg.sender) >= PRICE_ALL, "Not enough ApeCoin");
				apeCoin.transferFrom(msg.sender, _TREASURY, PRICE_ALL);				
		}
		// Get the MAYC interface
		IERC721 mayc = IERC721(_MAYC);
		// Check if caller is an apeHolder
		require(mayc.balanceOf(msg.sender) > 0, "Caller is not an ape holder");	
		// The caller is a MAYC Holder, Great!

		// Check deadline validity
		require(_deadline > block.timestamp || _deadline == 0, "Deadline must be at future or be 0");	
		
		_approveTransferForAllApesAfter(_deadline, msg.sender, _beneficiary);
	}
	// Internal function to register a beneficiary for All Apes and deadline. Emit ApprovalTransferForAllApesAfter
	function _approveTransferForAllApesAfter(
		uint _deadline, address _apeHolder, address _beneficiary
	) internal {
		_beneficiaries[_apeHolder][type(uint256).max] = _beneficiary;
		_deadlines[_apeHolder][type(uint256).max] = _deadline;
		emit ApprovalTransferForAllApesAfter(_deadline, _apeHolder, _beneficiary);
	}
	
	
	function claimAllApesFrom(address _apeHolder) public {
		// Get the beneficiary of the operator role for apeHolder tokens
		address _beneficiary = _beneficiaries[_apeHolder][type(uint256).max];
		// Check if caller is the beneficiary setted by the apeHolder
		require(_beneficiary == msg.sender, "Caller is not the beneficiary");
		// The caller is the beneficary designated by the apeHolder, great!
		// Get the deadline setted by the apeHolder
		uint _deadline = _deadlines[_apeHolder][type(uint256).max];
		require(_deadline < block.timestamp && _deadline != 0, "Deadline must be at the past");
		// The deadline has been reached, a true diamondhands holder is now in the APE-Halla,
		// celebrating with OdinApe and ApeThor, this APE is bored no more, Community cries and
		// makes the promise of never forget about its history, the first step will be to fullfill,
		// the wishes of this glorious APE, Initiates their successors into the Community.
		
		// Transfer All Apes to a new Holder designated by the glorious APE before goes to the APE-Halla
		ERC721Enumerable mayc = ERC721Enumerable(_MAYC);
		uint totalApes = mayc.balanceOf(_apeHolder);
		for (uint i = 0; i < totalApes; i++) {
			uint tokenId = mayc.tokenOfOwnerByIndex(_apeHolder, 0);
			mayc.safeTransferFrom(_apeHolder, _beneficiary, tokenId);
		}
		// Awesome, MAYC #tokenIds has been succesfully transferred from the APE-Halla! PLW3!
	}
	
	
	// Getters
	
	// Using MAX_UINT as _tokenId to enable inheritance to every ape owned by an apeHolder
	function getBeneficiary(address _apeHolder, uint _tokenId) external view returns (address) {
		return _beneficiaries[_apeHolder][_tokenId];
	}
	
	// Using MAX_UINT as _tokenId to enable inheritance to every ape owned by an apeHolder
	function getDeadline(address _apeHolder, uint _tokenId) external view returns (uint) {
		return _deadlines[_apeHolder][_tokenId];
	}
	
	// Receive & withdraw
	
	receive() external payable {
		require(true == false, "Cannot send ether to this contract");
	}
	
	function withdrawApeCoin() external {
		IERC20 apeCoin = IERC20(_APECOIN);
		uint balance = apeCoin.balanceOf(address(this));
		require(balance > 0, "There is no balance");
		apeCoin.transfer(_TREASURY, balance);		
	}
}
