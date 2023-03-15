const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");


describe("InheritApesBAYC · approveApeTransferAfter", function () {
	
	async function deployAndMint() {
		// Get signers
		const [deployer, apeHolder, beneficiary, other] = await ethers.getSigners();
		// Deploy InheritApesBAYC
		const InheritApesBAYC = await ethers.getContractFactory("InheritApesBAYC");
		const inheritApesBAYC = await InheritApesBAYC.deploy();
		await inheritApesBAYC.deployed();
		
		console.log(`InheritApesBAYC deployed to ${inheritApesBAYC.address}`);
		// Deploy AlphaToken
		const AlphaToken = await ethers.getContractFactory("SimpleERC721");
		const alphaToken = await AlphaToken.deploy("BoredApeYatchClub", "BAYC", "");
		await alphaToken.deployed();
		
		console.log(`AlphaToken deployed to ${alphaToken.address}`);
		// Mint some AlphaTokens
		await alphaToken.connect(apeHolder).mint(2);
		
		console.log(`AlphaToken #0 and #1 minted to ${apeHolder.address}`);
		console.log(`AlphaToken current Supply: ${await alphaToken.totalSupply()}`);
		// Mint some ApeCoins (M20)
		const ApeCoin = await ethers.getContractFactory("SimpleERC20");
		const apeCoin = await ApeCoin.deploy("ApeCoinM20", "ACM20");
		await apeCoin.deployed();
		
		console.log(`ApeCoin deployed to ${apeCoin.address}`);
		// Mint some ApeCoins
		await apeCoin.mint(apeHolder.address, ethers.utils.parseEther('300'));
		await apeCoin.mint(other.address, ethers.utils.parseEther('300'));
		console.log(`ApeCoins minted to ${apeHolder.address} and ${other.address}`);
		console.log(`Total supply: ${await apeCoin.totalSupply()}`);
				
		return { apeHolder, beneficiary, other, inheritApesBAYC, alphaToken, apeCoin };
	}
	
	
	it("Should mint some AlphaTokens to apeHolder", async function () {
		const {apeHolder, alphaToken, apeCoin} = await loadFixture(deployAndMint);
		expect(await alphaToken.ownerOf(0)).to.equal(apeHolder.address);
		expect(await alphaToken.ownerOf(1)).to.equal(apeHolder.address);
	});
	
	it("Should mint some ApeCoins to apeHolder and other", async function () {
		const {apeHolder, other, apeCoin} = await loadFixture(deployAndMint);
		expect(await apeCoin.balanceOf(apeHolder.address)).to.equal(ethers.utils.parseEther('300'));
		expect(await apeCoin.balanceOf(other.address)).to.equal(ethers.utils.parseEther('300'));
	});
	
// approveApeTransferAfter
// success
	
	it("approveApeTransferAfter · Should set a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
		
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, tokenId)
		).to.equal(beneficiary.address);
	});
	
	it("approveApeTransferAfter · Should set a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
		
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, tokenId)
		).to.equal(deadline);
	});
/*	
	it("approveApeTransferAfter · Should set beneficiary & deadline (approvedForAll)", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(other).approve(inheritApesBAYC.address, price);
		
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Approve other as operator for all
		await alphaToken.connect(apeHolder).setApprovalForAll(other.address, true);
		
		const otherApprovedForAll = other;
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(otherApprovedForAll).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, tokenId)
		).to.equal(deadline);
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, tokenId)
		).to.equal(beneficiary.address);
	});	
*/
	it("approveApeTransferAfter · Should update a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('6');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		const newBeneficiary = other;
		
		// Call approveApeTransferAfter to update beneficiary
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, newBeneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, tokenId)
		).to.equal(newBeneficiary.address);
	});	
	
	it("approveApeTransferAfter · Should update a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('6');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);	
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		const newDeadline = (await time.latest()) + 200; // 200 seconds in the future for testing;
		
		// Call approveApeTransferAfter to update beneficiary
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			newDeadline, beneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, tokenId)
		).to.equal(newDeadline);
	});
	
	it("approveApeTransferAfter · Should unregister a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('6');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		const newBeneficiary = '0x0000000000000000000000000000000000000000';
		
		// Call approveApeTransferAfter to update beneficiary
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, newBeneficiary, tokenId
		);
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, tokenId)
		).to.equal(newBeneficiary);
	});	
	
	it("approveApeTransferAfter · Should unregister a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('6');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		const newDeadline = 0;
		
		// Call approveApeTransferAfter to update beneficiary
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			newDeadline, beneficiary.address, tokenId
		);
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, tokenId)
		).to.equal(newDeadline);
	});	
	//TODO emit events
	
// approveApeTransferAfter
// fail

	it("approveApeTransferAfter · Should fail if caller has no enough ApeCoin to pay", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('6');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await expect(
			inheritApesBAYC.connect(beneficiary).approveApeTransferAfter(
				deadline, beneficiary.address, tokenId
		)).to.be.revertedWith("Not enough ApeCoin");
	});
	
	it("approveApeTransferAfter · Should fail if caller has no enough ApeCoin allowance", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, other, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await expect(
			inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
				deadline, beneficiary.address, tokenId
		)).to.be.revertedWith("ERC20: insufficient allowance");
	});

	it("approveApeTransferAfter · Should fail if tokenId is not valid (higher)", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 999999999; // Invalid tokenId for testing, should fail
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
		
		/*
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		*/
		
		// Call approveApeTransferAfter 
		await expect(
			inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
				deadline, beneficiary.address, tokenId
		)).to.be.revertedWith("Invalid tokenId");
	});
	
	it("approveApeTransferAfter · Should fail if caller is not token owner", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(other).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await expect(
			inheritApesBAYC.connect(other).approveApeTransferAfter(
				deadline, beneficiary.address, tokenId
		)).to.be.revertedWith("Caller is not token owner");
	});
	
	
	it("approveApeTransferAfter · Should fail if deadline is in the past", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) - 2; // 2 seconds in the past for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await expect(
			inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
				deadline, beneficiary.address, tokenId
		)).to.be.revertedWith("Deadline must be at future or be 0");
	});

// claimApe
// success	
	
	it("claimApe · Should transfer tokenId to beneficiary if ape is claimable", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
		
		// Call claimApe
		await inheritApesBAYC.connect(beneficiary).claimApe(tokenId);
		
		expect(await alphaToken.ownerOf(tokenId)).to.equal(beneficiary.address);
	});

// claimApe	
// fail

	it("claimApe · Should fail if caller is not the beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);	
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
			
		// Call claimApe
		await expect(
			inheritApesBAYC.connect(other).claimApe(tokenId)
		).to.be.revertedWith("Caller is not the beneficiary");
	});

	it("claimApe · Should fail if tokenId is invalid", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);	
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
			
		const invalidTokenId = 999999999;
		
		// Call claimApe
		await expect(
			inheritApesBAYC.connect(beneficiary).claimApe(invalidTokenId)
		).to.be.revertedWith("Invalid tokenId");
	});	
	
	it("claimApe · Should fail if deadline is not at the past (future)", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		// Call claimApe
		await expect(
			inheritApesBAYC.connect(beneficiary).claimApe(tokenId)
		).to.be.revertedWith("Deadline must be at the past");
	});
	
	it("claimApe · Should fail if deadline is not at the past (zero)", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = 0;
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, beneficiary.address, tokenId
		);
		
		// Call claimApe
		await expect(
			inheritApesBAYC.connect(beneficiary).claimApe(tokenId)
		).to.be.revertedWith("Deadline must be at the past");
	});
	
	it("claimApe · Should fail if beneficiary is the zero address", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const tokenId = 0;
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('3');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
			
		// Approve InheritApesBAYC contract to transfer the asset
		await alphaToken.connect(apeHolder).approve(inheritApesBAYC.address, tokenId);
		
		// Call approveApeTransferAfter 
		await inheritApesBAYC.connect(apeHolder).approveApeTransferAfter(
			deadline, '0x0000000000000000000000000000000000000000', tokenId
		);
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
		
		// Call claimApe
		await expect(
			inheritApesBAYC.connect(beneficiary).claimApe(tokenId)
		).to.be.revertedWith("Caller is not the beneficiary");
	});
	
// approveTransferForAllApesAfter
// success

	it("approveTransferForAllApesAfter · Should set a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, maxUint)
		).to.equal(beneficiary.address);		
	});
	
	it("approveTransferForAllApesAfter · Should set a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, maxUint)
		).to.equal(deadline);		
	});
	
	it("approveTransferForAllApesAfter · Should update a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 20; // 20 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		const newBeneficiary = other;
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, newBeneficiary.address
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, maxUint)
		).to.equal(newBeneficiary.address);		
	});
	
	it("approveTransferForAllApesAfter · Should update a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		const newDeadline = (await time.latest()) + 500; // 500 seconds in the future for testing
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			newDeadline, beneficiary.address
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, maxUint)
		).to.equal(newDeadline);		
	});
	
	it("approveTransferForAllApesAfter · Should unregister a beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 20; // 20 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, '0x0000000000000000000000000000000000000000'
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getBeneficiary(apeHolder.address, maxUint)
		).to.equal('0x0000000000000000000000000000000000000000');		
	});
	
	it("approveTransferForAllApesAfter · Should unregister a deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			0, beneficiary.address
		);
		
		const maxUint = ethers.constants.MaxUint256;
		
		expect(
			await inheritApesBAYC.getDeadline(apeHolder.address, maxUint)
		).to.equal(0);		
	});

// approveTransferForAllApesAfter	
// fail

	it("approveTransferForAllApesAfter · Should fail if caller has no enough ApeCoin", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
				
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await expect(
			inheritApesBAYC.connect(beneficiary).approveTransferForAllApesAfter(
				deadline, beneficiary.address
		)).to.be.revertedWith("Not enough ApeCoin");		
	});
	
	it("approveTransferForAllApesAfter · Should fail if caller has no enough ApeCoin allowance", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
				
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await expect(
			inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
				deadline, beneficiary.address
		)).to.be.revertedWith("ERC20: insufficient allowance");		
	});

	it("approveTransferForAllApesAfter ·  Should fail if caller is not token owner", async function() {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(other).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);
		
		// Call	approveTransferForAllApesAfter
		await expect(
			inheritApesBAYC.connect(other).approveTransferForAllApesAfter(
				deadline, beneficiary.address
		)).to.be.revertedWith("Caller is not an ape holder");		
	});
	
	it("approveTransferForAllApesAfter ·  Should fail if deadline is at the past", async function() {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) - 5; // 5 seconds in the past for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);
		
		// Call	approveTransferForAllApesAfter
		await expect(
			inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
				deadline, beneficiary.address
		)).to.be.revertedWith("Deadline must be at future or be 0");		
	});

// claimAllApesFrom
// success

	it("claimAllApesFrom · Should transfer all apes of an apeHolder to a beneficiary after reach the deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);

		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
		
		// Call claimAllApesFrom
		await inheritApesBAYC.connect(beneficiary).claimAllApesFrom(apeHolder.address);
		
		expect(
			await alphaToken.ownerOf(0)
		).to.equal(beneficiary.address);		
		expect(
			await alphaToken.ownerOf(1)
		).to.equal(beneficiary.address);
	});
	
// claimAllApesFrom
// fail

	it("claimAllApesFrom · Should fail before reach the deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Call claimAllApesFrom
		await expect(
			inheritApesBAYC.connect(beneficiary).claimAllApesFrom(apeHolder.address)
		).to.be.revertedWith("Deadline must be at the past");
	});
	
	it("claimAllApesFrom · Should fail if caller is not the beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
		
		// Call claimAllApesFrom
		await expect(
			inheritApesBAYC.connect(other).claimAllApesFrom(apeHolder.address)
		).to.be.revertedWith("Caller is not the beneficiary");
	});
	
	it("claimAllApesFrom · Should fail after unregister deadline", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);

		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		const deadline = (await time.latest()) + 5; // 5 seconds in the future for testing
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			0, beneficiary.address
		);
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(6000);
		
		// Call claimAllApesFrom
		await expect(
			inheritApesBAYC.connect(beneficiary).claimAllApesFrom(apeHolder.address)
		).to.be.revertedWith("Deadline must be at the past");		
	});
	
	it("claimAllApesFrom · Should fail after unregister beneficiary", async function () {
		const {inheritApesBAYC, apeHolder, beneficiary, alphaToken, other, apeCoin} = await loadFixture(
			deployAndMint
		);
		
		const deadline = (await time.latest()) + 10; // 5 seconds in the future for testing
		const price = ethers.utils.parseEther('10');
		
		// Approve InheritApesBAYC contract to charge ApeCoin for the service 
		await apeCoin.connect(apeHolder).approve(inheritApesBAYC.address, price);
						
		// Approve InheritApesBAYC contract to transfer the assets
		await alphaToken.connect(apeHolder).setApprovalForAll(inheritApesBAYC.address, true);	
		
		// Call	approveTransferForAllApesAfter
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, beneficiary.address
		);
		
		// Call	approveTransferForAllApesAfter again to unregister
		await inheritApesBAYC.connect(apeHolder).approveTransferForAllApesAfter(
			deadline, '0x0000000000000000000000000000000000000000'
		);
		
		// Some delay to reach the deadline
		const delay = ms => new Promise(res => setTimeout(res, ms));
		await delay(10000);
		
		// Call claimAllApesFrom
		await expect(
			inheritApesBAYC.connect(beneficiary).claimAllApesFrom(apeHolder.address)
		).to.be.revertedWith("Caller is not the beneficiary");				
	});
	
// WithdrawApeCoin
// success
	it("WithdrawApeCoin · Should be able to withdraw ApeCoins from the contract", async function (){
		const {inheritApesBAYC, other, apeCoin} = await loadFixture(deployAndMint);
		
		const apeCoinAmount = ethers.utils.parseEther('10');
		
		await apeCoin.connect(other).transfer(inheritApesBAYC.address, apeCoinAmount);
		
		expect
			(await apeCoin.balanceOf(inheritApesBAYC.address))
		.to.equal(apeCoinAmount);
		
		await inheritApesBAYC.connect(other).withdrawApeCoin();
		
		expect
			(await apeCoin.balanceOf(inheritApesBAYC.address))
		.to.equal(0);
		
		expect
			(await apeCoin.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"))
		.to.equal(ethers.utils.parseEther('310'));		
	});
	
// Receive
// Fail
	it("Receive · The contract should not accept ether", async function () {
		const {inheritApesBAYC, other} = await loadFixture(deployAndMint);
		
		const amount = ethers.utils.parseEther('10'); 
		
		await expect(
			other.sendTransaction({to: inheritApesBAYC.address, value: amount})
		).to.be.revertedWith("Cannot send ether to this contract");
	});
});
