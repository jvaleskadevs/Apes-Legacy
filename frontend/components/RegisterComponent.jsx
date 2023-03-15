import { useEffect, useState } from 'react';
import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import Link from 'next/link';
import { ethers } from "ethers";
import FormField from '/components/FormField';
import Header from '/components/Header';
import CustomButton from '/components/CustomButton';
import { useAccount,  useSigner } from 'wagmi';
import { Alchemy, Network } from 'alchemy-sdk';
import {
	apeCoinContractAddress,
	apeCoinAbi,
	apesContractAddresses,
	apesContractAbis, 
	inheritApesContractAddresses, 
	inheritApesAbis,
	PRICE, PRICE_ALL,
	toastOptions
} from '/constants';
import { toast } from 'react-toastify';

export default function RegisterComponent() {
	const router = useRouter();
	const path = router.asPath.split('/');
	const ape = path[2];
	const tokenID = path[4];
	
	const { data: signer } = useSigner({
		onSuccess(data) {
			console.log('Success-signer', data);	
		}
	});
	
	const createApeCoinContract = (signer) => {
		const contract = new ethers.Contract(
			apeCoinContractAddress,
			apeCoinAbi,
			signer
		);
		setApeCoinContract(contract);
	}
	
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

	const { isConnected, address } = useAccount();
	
	const [apeCoinContract, setApeCoinContract] = useState({});
	const [apesContract, setApesContract] = useState({});
	const [inheritApesContract, setInheritApesContract] = useState({});
	
	const [form, updateForm] = useState({
		deadline: "",
		beneficiary: ""
	});
	
	const handleFormFieldChange = (fieldName, e) => {
		updateForm({ ...form, [fieldName]: e.target.value });
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		
		const deadlineMs = new Date(form.deadline).getTime();
		console.log("Deadline: ", deadlineMs);
		const nowMs = new Date().getTime();
		console.log("Now: ", nowMs);
		
		if (deadlineMs < nowMs) {
			console.log("The date limit MUST be at the future or be zero");
			notify(false, 'The date limit MUST be at the future or be zero to cancel');
			return;
		}
		
		if (!ethers.utils.isAddress(form.beneficiary)) {
			console.log("Invalid beneficiary address");
			notify(false, 'Invalid beneficiary address');
			return;			
		}
		
		const deadline = BigInt(Math.floor(deadlineMs / 1000));
		
		if (!inheritApesContract) {
			createInheritApesContract(ape, signer);	
		}
		
		
		try {

			if (tokenID === 'all') {
				await registerAllApes(deadline, form.beneficiary);
			} else {
				await registerApe(deadline, form.beneficiary, tokenID);
			}
					
			notify(true, 'Transaction sent. Waiting for confirmation.');	
			console.log("Sending transaction....");
			console.log("Waiting for confirmation....");
		} catch (err) {
			console.log(err);
			notify(false, err.message);
		}
	}
	
	const registerApe = async (deadline, beneficiary, tokenID) => {

		await apeCoinContract.approve(
			inheritApesContract.address,
			PRICE
		);
		
		await apesContract.approve(
			inheritApesContract.address,
			tokenID
		);

		await inheritApesContract.approveApeTransferAfter(
			deadline, 
			beneficiary,
			tokenID
		);	
		onRegisterApeEvent();
	}
	
	const registerAllApes = async (deadline, beneficiary) => {
		await apeCoinContract.approve(
			inheritApesContract.address,
			PRICE_ALL
		);
		
		await apesContract.setApprovalForAll(
			inheritApesContract.address,
			true
		);
		
		await inheritApesContract.approveTransferForAllApesAfter(
			deadline, 
			beneficiary
		);
		onRegisterAllApesEvent();
	}
	
	const onRegisterApeEvent = () => {
		const event = inheritApesContract.filters.ApprovalApeTransferAfter();
		const provider = inheritApesContract.provider;
		provider.removeListener(event);
		
		provider.on(event, (logs) => {
			const parsedLogs = inheritApesContract.interface.parseLog(logs);
			
			console.log(parsedLogs);
			
			if (address === parsedLogs.args.apeHolder) {
				notify(true, 'Registered successfully');
				router.push({
					pathname: '/apes/[ape]/tokens/select',
					query: { ape: ape, tokenId: tokenID }
				});				
			}
		});
	}
	
	const onRegisterAllApesEvent = () => {
		const event = inheritApesContract.filters.ApprovalTransferForAllApesAfter();
		const provider = inheritApesContract.provider;
		provider.removeListener(event);
		
		provider.on(event, (logs) => {
			const parsedLogs = inheritApesContract.interface.parseLog(logs);
			
			console.log(parsedLogs);
			
			if (address === parsedLogs.args.apeHolder) {
				notify(true, 'Registered successfully');
				router.push({
					pathname: '/apes/[ape]/tokens/select',
					query: { ape: ape, tokenId: tokenID }
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
			createApeCoinContract(signer);
			createApesContract(ape, signer);
			createInheritApesContract(ape, signer);
		}
	}, [signer, ape]);
	
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<Header />
			</header>

			<div className={styles.buttons_container}>
				<form onSubmit={handleSubmit}>
					<FormField
						labelName={`The beneficiary will be able to claim ${tokenID === 'all' ? 'ALL your APES':'your APE'} after`}
						placeholder="Select a date"
						inputType="date"
						value={form.deadline}
						handleChange={(e) => handleFormFieldChange('deadline', e)}
					/>
					<FormField
						labelName="Beneficiary address"
						placeholder={ethers.constants.AddressZero}
						inputType="text"
						value={form.beneficiary}
						handleChange={(e) => handleFormFieldChange('beneficiary', e)}
					/>
					<FormField
						labelName="Price"
						inpuyType="text"
						value={`${ethers.utils.formatEther(
							tokenID === 'all' 
							? PRICE_ALL 
							: PRICE
						).split('.')[0]} Ape Coin`}
						readOnly
					/>
					
					<div>
						<CustomButton
							btnType="submit"
							title={tokenID !== 'all' ? 'Register APE' : 'Register all APES'}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}
