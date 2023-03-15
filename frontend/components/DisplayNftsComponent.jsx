import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import Link from 'next/link';
import { ethers } from 'ethers';
import styles from "../styles/DisplayNfts.module.css";
import { apesContractAddresses, inheritApesContractAddresses, inheritApesAbis } from "../constants/index.js";
import NftCard from './NftCard';
import CustomButton from './CustomButton';
import { useAccount, useSigner } from 'wagmi';

export default function DisplayNftsComponent() {
	const router = useRouter();
	const ape = router.asPath.split('/')[2];
	
	const { address, isConnected } = useAccount();
	const { data: signer } = useSigner();

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
				const beneficiaryForAll = await inheritApesContract.getBeneficiary(address, ethers.constants.MaxUint256);
				const deadlineForAll = await inheritApesContract.getDeadline(address, ethers.constants.MaxUint256);
				const i = ape === 'bayc' ? 0 : ape === 'mayc' ? 1 : ape === 'bakc' ? 2 : null;
				let apes = [];
				for (let jj = 0; jj < res.nfts.length; jj++) {
					if (res.nfts[jj].contract === apesContractAddresses[i].toLowerCase()) {
						let beneficiary;
						let deadline;
						if (beneficiaryForAll == ethers.constants.AddressZero) {
							beneficiary = await inheritApesContract.getBeneficiary(address, res.nfts[jj].tokenId);
							deadline = await inheritApesContract.getDeadline(address, res.nfts[jj].tokenId);
						} else {
							beneficiary = beneficiaryForAll;
							deadline = deadlineForAll;
						}
						apes.push({ ...res.nfts[jj], 
							beneficiary: beneficiary,// await inheritApesContract.getBeneficiary(address, res.nfts[jj].tokenId),
							deadline: deadline,//await inheritApesContract.getDeadline(address, res.nfts[jj].tokenId),
							ape: ape
						});
					}
				}
				
				await apes;
				
				console.log(apes);
				
				if (nfts?.length && pageKey) {
					setNfts((prevState) => [...prevState, ...apes]);
				} else {
					//setNfts();
					setNfts(apes);
				}
				//console.log(res.pageKey);
				//console.log(res.nfts[0]);
				
				if (res.pageKey) {
					//await fetchApes(res.pageKey);
					setPageKey(res.pageKey);
					console.log("pagekey", res.pageKey);
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
	
	return (
	<div className={styles.nft_gallery_page}>
      {isLoading ? (
        <div className={styles.loading_box}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.nft_gallery}>
          <div>
           { nfts?.length && (
          	<Link href={{
          		pathname: '/apes/[ape]/tokens/[tokenId]/register',
          		query: { ape: ape, tokenId: 'all' }
          	}}>
          	  <CustomButton 
          	    type="button"
          	    title="Select All"
          	  />
          	</Link>
          	)}
          </div>
          <div className={styles.nfts_display}>
            {nfts?.length ? (
              nfts.map((nft) => {
              	//if (nft.contract === apesContractAddresses[ii].toLowerCase()) {
              		
                	return (
                	<Link
                		key={`${nft.tokenId}${nft.contract}`}
						href={{
							pathname: '/apes/[ape]/tokens/[tokenId]/register',
							query: { ape: ape, tokenId: nft.tokenId }
						}}
                	>
                		<NftCard key={`${nft.tokenId}${nft.contract}`} nft={nft} />
            		</Link>
            		);
              	//}
              })
            ) : (
              <div className={styles.loading_box}>
                <p>No Apes found. Connect your wallet.</p>
              </div>
            )}
          </div>
        </div>
      )}		
	</div>
	);
}
