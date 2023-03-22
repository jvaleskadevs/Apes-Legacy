import { useEffect, useState} from 'react';
import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import { useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import * as PushAPI from "@pushprotocol/restapi";
import { pushChannelAddress } from '/constants';
import { usePolybase, useDocument } from "@polybase/react";
import FormField from '/components/FormField';
import Header from '/components/Header';
import CustomButton from '/components/CustomButton';
import { apesContractAddresses, inheritApesContractAddresses, inheritApesAbis, toastOptions } from "../constants/index.js";
import { toast } from 'react-toastify';

export default function NotifyComponent () {
	const router = useRouter();
	const ape = router.asPath.split('/')[2];
	
	const { address, isConnected } = useAccount();
	const { data: signer } = useSigner();
	const polybase = usePolybase();
	
	const [databaseUser, setDatabaseUser] = useState();
	const [notifyBefore, setNotifyBefore] = useState(''); 
	const [deadlines, setDeadlines] = useState();
	
	const subscribeToChannel = async () => {
		await PushAPI.channels.subscribe({
			signer: signer,
			channelAddress: `eip155:5:${pushChannelAddress}`,
			userAddress: `eip155:5:${address}`,
			onSuccess: () => console.log('Opt-in success'),
			onError: (err) =>  { throw err },
			env: 'staging'
		});
	}
	
	const unsubscribeToChannel = async () => {
		await PushAPI.channels.unsubscribe({
			signer: signer,
			channelAddress: `eip155:5:${pushChannelAddress}`,
			userAddress: `eip155:5:${address}`,
			onSuccess: () => console.log('Opt-out success'),
			onError: (err) => { throw err },
			env: 'staging'
		});	
	}
	
	const subscribeToDatabase = async () => {
		try {
			const user = await getDatabaseUser();
			setDatabaseUser(user);
			console.log(user);
			
			for (let i = 0; i < nfts.length; i++) {
				if (nfts[i].deadline == ethers.constants.AddressZero) {
					continue;
				}
				await createNewNotification(nfts[i].tokenId, nfts[i].deadline);
			}
		} catch (err) {
			console.log(err);
		}
	}
	
	const unsubscribeToDatabase = async () => {
		try {
			await polybase.collection('User').record(address).call("del");
			
			for (let i = 0; i < nfts.length; i++) {
				if (nfts[i].deadline == ethers.constants.AddressZero) {
					continue;
				}
				await polybase.collection('Notifications').record(
					address.concat('/', ape, '/', tokenId)
				).call("del");
			}
		} catch (err) {
			console.log(err);
		}
	}
	
	const getDatabaseUser = async () => {
		try {
			return await polybase.collection('User').record(address).get();
		} catch (err) {
			return await polybase.collection('User').create([address]);
		}		
	}
	
	const createNewNotification = async (tokenId, deadline) => {
		deadline = new Date(deadline * 1000).getTime();
		const notifyAfter = deadline - (notifyBefore * 86400000);
		try {
			await polybase.collection("Notifications").create([
				//id
				ape,//ape
				tokenId,//token
				deadline,//((new Date().getTime()) + 1200),//deadline
				notifyAfter,//((new Date().getTime()) - 1200),//notifyAfter
				polybase.collection('User').record(address)//owner
			]);
			
		} catch (err) {
			if (err.code == "already-exists") {
				await polybase.collection("Notifications").record(
					address.concat('/', ape, '/', tokenId)
				).call("update", [
					deadline,
					notifyAfter
				]);
			}
			console.log(err);
		}
	}
	
	const handleFormFieldChange = (e) => {
		setNotifyBefore(e.target.value);
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
			await subscribeToChannel();
			await subscribeToDatabase();
			notify(true, 'Notifications ON');
		} catch (err) {
			console.log(err);
			notify(false, err.message);
		}		
	}
	
	const handleUnsubscribeClick = async () => {
		//await polybase.collection("User").record(address).call("updatePublicKey", []);
		
		try {
			await unsubscribeToChannel();
			await unsubscribeToDatabase(); 
			notify(true, 'Notifications OFF');
		} catch (err) {
			console.log(err);
			notify(false, err.message);
		}
	}
	
	const [nfts, setNfts] = useState();
	const [pageKey, setPageKey] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	
	const createInheritApesContract = () => {
		const i = ape === 'bayc' ? 0 : ape === 'mayc' ? 1 : ape === 'bakc' ? 2 : null;
		if (i !== null) {
			const contract = new ethers.Contract(
				inheritApesContractAddresses[i], 
				inheritApesAbis[i], 
				signer
			);
			console.log(`Inh ${ape} Contract ready: ${contract.address}`);
			return contract;
		}
	};

	const fetchNtfs = async () => {
	
		if (!pageKey) setIsLoading(true);
		
		const endpoint = '/api/getNftsForOwner';
		const chain = process.env.NEXT_PUBLIC_ALCHEMY_NETWORK;
		
		try {
			
			const res = await fetch(endpoint, {
				method: 'POST',
				body: JSON.stringify({
					address,
					chain,
					pageKey: pageKey ? pageKey : null
				})
			}).then(res => res.json());
			
			if (res.nfts) {
				
				const inheritApesContract = createInheritApesContract();
				const deadlineForAll = await inheritApesContract.getDeadline(address, ethers.constants.MaxUint256);
				const i = ape === 'bayc' ? 0 : ape === 'mayc' ? 1 : ape === 'bakc' ? 2 : null;
				let apes = [];
				for (let jj = 0; jj < res.nfts.length; jj++) {
					if (res.nfts[jj].contract === apesContractAddresses[i].toLowerCase()) {
						let deadline;
						if (deadlineForAll == 0) {
							deadline = await inheritApesContract.getDeadline(address, res.nfts[jj].tokenId);
						} else {
							deadline = deadlineForAll;
						}
						apes.push({ ...res.nfts[jj],
							deadline: deadline,
							ape: ape
						});
					}
				}
				
				if (nfts?.length && pageKey) {
					setNfts((prevState) => [...prevState, ...apes]);
				} else {
					console.log(apes);
					setNfts(apes);
				}
				
				if (res.pageKey) {
					setPageKey(res.pageKey);
				} else {
					setPageKey("");
				}
			}			
		} catch (err) {
			console.log(err);
		}
		setIsLoading(false);
	}
	
	useEffect(() => {
		if (signer && ape) fetchNtfs();
	}, [ape, signer, pageKey]);
	
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
	
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<Header />
			</header>			
			
			<div>
				<h3>{databaseUser ? databaseUser.data.id : ""}</h3>
			</div>
			
			<div className={styles.buttons_container}>
				<form onSubmit={handleSubmit}>
					<FormField
						labelName="Days before claim date to notify"
						placeholder="30 days before the claim date"
						inputType="number"
						value={notifyBefore}
						handleChange={(e) => handleFormFieldChange(e)}
					/>
					<FormField
						labelName="Frequency of notifications"
						value="Daily"
						inputType="text"
						readOnly
					/>
					<div>
						<CustomButton 
							title="Cancel Notifications"
							type="button"
							styles="outlined"
							handleClick={handleUnsubscribeClick}
						/>
						<CustomButton 
							title="Activate Notifications"
							type="submit"
							//handleClick={handleSubscribeClick}
						/>

					</div>					
				</form>
			</div>
		</div>
	);
}
