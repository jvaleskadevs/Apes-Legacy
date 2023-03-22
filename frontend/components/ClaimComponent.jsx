import { useEffect, useState } from 'react';
import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import Link from 'next/link';
import { ethers } from "ethers";
import FormField from '/components/FormField';
import Header from '/components/Header';
import CustomButton from '/components/CustomButton';
import { useAccount,  useSigner } from 'wagmi';
import { 
	inheritApesContractAddresses, 
	inheritApesAbis,
	apesContractAddresses,
	apesContractAbis,
	toastOptions
} from '/constants';
import { toast } from 'react-toastify';

export default function ClaimComponent() {
	const router = useRouter();
	const ape = router.asPath.split('/')[2];
		
	const [tokenID, setTokenID] = useState('');
	const [apeHolderAddress, setApeHolderAddress] = useState('');
	const [inheritApesContract, setInheritApesContract] = useState({});
	const [apesContract, setApesContract] = useState({});
	
	const [claimMode, setClaimMode] = useState('by_token_id');
	
	const { data: signer } = useSigner({
		onSuccess(data) {
			console.log('Success-signer', data);
		}
	});
	
	const { isConnected, address } = useAccount();
	
	const createApesContract = (ape, signer) => {
		let i = ape === 'bayc' ? 0 : ape === 'mayc' ? 1 : ape === 'bakc' ? 2 : null;
		if (i !== null) {
			const contract = new ethers.Contract(
				apesContractAddresses[i], 
				apesContractAbis[i], 
				signer
			);
			console.log(`${ape} Contract ready: ${contract.address}`);
			setApesContract(contract);
		}
	};
	
	const createInheritApesContract = (ape, signer) => {
		let i = ape === 'bayc' ? 0 : ape === 'mayc' ? 1 : ape === 'bakc' ? 2 : null;
		if (i !== null) {
			const contract = new ethers.Contract(
				inheritApesContractAddresses[i], 
				inheritApesAbis[i], 
				signer
			);
			console.log(`Inh ${ape} Contract ready: ${contract.address}`);
			setInheritApesContract(contract);
		}
	};
	
	const handleFormFieldChange = (e) => {
		if (claimMode === 'by_token_id') {
			setTokenID(e.target.value);
		} else {
			setApeHolderAddress(e.target.value);
		}
		
	}
	
	const handleChangeClaimMode = (e) => {
		e.preventDefault();
		
		if (claimMode === 'by_token_id') {
			setClaimMode('all_by_owner');
			setTokenID('');
			setApeHolderAddress('');
		} else {
			setClaimMode('by_token_id');
			setApeHolderAddress('');
			setTokenID('');
		}
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
		
			if (claimMode === 'by_token_id') {
				
				if (tokenID < 0 || tokenID > 9999) {
					console.log("Invalid TokenID");
					notify(false, 'Invalid tokenID');
					return;
				}
				
				await inheritApesContract.claimApe(tokenID);
				
			} else {
				if (!ethers.utils.isAddress(apeHolderAddress) || apeHolderAddress == ethers.constants.AddressZero) {
					console.log("Invalid holder address");
					notify(false, 'Invalid holder address');
					return;			
				}
				
				await inheritApesContract.claimAllApesFrom(apeHolderAddress);
			}
			onTransferApeEvent();
			
			notify(true, 'Transaction sent. Waiting for confirmation.');
			console.log("Sending transaction....");
			console.log("Waiting for confirmation....");			
		} catch (err) {
			console.log(err);
			notify(false, err.message);
		}
	}
	
	const onTransferApeEvent = () => {
		const event = apesContract.filters.Transfer();
		const provider = apesContract.provider;
		provider.removeListener(event);
		
		provider.on(event, (logs) => {
			const parsedLogs = apesContract.interface.parseLog(logs);
			
			console.log(parsedLogs);
			
			if (address === parsedLogs.args.to) {
				notify(true, 'Claimed successfully');
				router.push({
					pathname: '/apes/[ape]/tokens/select',
					query: { ape: ape }
				});				
			}
		});
	}
	
	const notify = (success, message) => {
		if (message.includes('reason=')) {
			message = message.slice(message.indexOf('reason="')+8, message.indexOf('", method="')).replace('execution reverted', '');
		} else if (message.includes('user rejected')) {
			message = "User rejected transaction"; 
		}
		if (success) {
			toast.success(message, toastOptions);
		} else {
			toast.error(message, toastOptions);
		}
	}
	
	useEffect(() => {
		if (signer && ape)  {
			createApesContract(ape, signer);
			createInheritApesContract(ape, signer);
		}
	}, [signer, ape]);
		 
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					Apes{" "}<span>Legacy</span>
				</h1>
				<p>
					Apes Inheritance powered by{" "}
					<span>Ape Coin</span>
				</p>
			</header>
			
			{ isConnected ? (

			<div className={styles.buttons_container}>
				<form onSubmit={handleSubmit}>
					<FormField
						labelName={claimMode === 'by_token_id' ? 'Ape Token ID' : 'From Address'}
						placeholder=""
						inpuyType={claimMode === 'by_token_id' ? 'number' : 'text'}
						value={claimMode === 'by_token_id' ? tokenID : apeHolderAddress}
						handleChange={(e) => handleFormFieldChange(e)}
					/>

					<div>
						<p	
							className={styles.small_p}
						 	onClick={(e) => handleChangeClaimMode(e)}
						 >
							<u>{claimMode === 'by_token_id' ? 'Change to Batch Claim' : 'Change to Claim by tokenId'}</u>
						</p>
						<CustomButton
							btnType="submit"
							title={claimMode === 'by_token_id' ? 'Claim APE' : 'Claim all APES'}
						/>
					</div>
				</form>
			</div>
			) : (
              <div className={styles.loading_box}>
                <p>Please, connect your wallet.</p>
              </div>				
			)}
		</div>
	);
}

