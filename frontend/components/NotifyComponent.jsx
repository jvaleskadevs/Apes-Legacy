import { useEffect, useState} from 'react';
import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import { useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import * as PushAPI from "@pushprotocol/restapi";
import { pushChannelAddress } from '/constants';
import { usePolybase, useAuth } from "@polybase/react";
import { ethPersonalSignRecoverPublicKey } from '@polybase/eth';
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
	
	
	const { auth, state } = useAuth();
	
	console.log(auth);
	console.log(state);

	async function getPublicKey() {
		const msg = 'Login with Chat *';
		const sig = await auth.ethPersonalSign(msg);
		const publicKey = ethPersonalSignRecoverPublicKey(sig, msg);
		return '0x' + publicKey.slice(4); //?!
	}
	
  	const polybaseSignIn = async () => { 
    	const res = await auth?.signIn({ 
    		force: address.toLowerCase() != auth?.state?.userId 
		});
    	
    	let publicKey = res.publicKey;
    	
    	if (!publicKey) {
    		console.log("no publickey");
    		publicKey = await getPublicKey();
    		console.log(publicKey);
    	}
    	
    	polybase.signer(async (data) => {
			return {
				h: 'eth-personal-sign',
				sig: await auth?.ethPersonalSign(data)
			}
		});
  	}
	
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
			const authState = await polybaseSignIn();
			console.log(authState);
			console.log(state);
			
			const user = await getDatabaseUser();
			console.log(user);
			setDatabaseUser(user);
			
			for (let i = 0; i < nfts.length; i++) {
				await createNewNotification(nfts[i].tokenId, nfts[i].deadline);
			}
			
		} catch (err) {
			console.log(err);
		}
	}
	
	const unsubscribeToDatabase = async () => {
		try {
			const authState = await polybaseSignIn();
			console.log(authState);
			console.log(state);
			
			for (let i = 0; i < nfts.length; i++) {
				await polybase.collection('Notifications').record(
					address.toLowerCase().concat('/', ape, '/', nfts[i].tokenId)
				).call("del");
			}
			await polybase.collection('User').record(address.toLowerCase()).call("del");
		} catch (err) {
			console.log(err);
		}
	}
	
	const getDatabaseUser = async () => {
		try {
			return await polybase.collection('User').record(address.toLowerCase()).get();
		} catch (err) {
			return await polybase.collection('User').create([address.toLowerCase()]);
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
				polybase.collection('User').record(address.toLowerCase())//owner
			]);
			
		} catch (err) {
			console.log(err);
			if (err.code == "already-exists") {
				await polybase.collection("Notifications").record(
					address.toLowerCase().concat('/', ape, '/', tokenId)
				).call("update", [
					deadline,
					notifyAfter
				]);
			}
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
	
	const handleUnsubscribeClick = async (e) => {
		e.preventDefault();

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
						if (deadline > ethers.constants.AddressZero) {
							apes.push({ ...res.nfts[jj],
								deadline: deadline,
								ape: ape
							});						
						}
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
	
	useEffect(() => {
		auth?.onAuthUpdate((authState) => {
			polybase.signer(async (data) => {
				return {
					h: 'eth-personal-sign',
					sig: await auth.ethPersonalSign(data),
				}
			});
		});
	}, [address]);
	
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<Header />
			</header>
			
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
							handleClick={(e) => handleUnsubscribeClick(e)}
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
