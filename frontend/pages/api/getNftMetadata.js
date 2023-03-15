import { Network, Alchemy } from 'alchemy-sdk';

export default async function handler(req, res) {
	const { contractAddress, tokenId } = JSON.parse(req.body);
	
	if (req.method !== 'POST') {
		res.status(405).send({ message: "Only POST requests allowed" });
		return;	
	}
	
	const settings = {
		apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
		network: Network.ETH_GOERLI
	};
	
	const alchemy = new Alchemy(settings);
	
	try {
		console.log("Here");
		const nft = await alchemy.nft.getNftMetadata(
			contractAddress,
			tokenId.toString()
		);
		console.log(nft);
		
		let formattedNft;
		if (nft) {
			formattedNft = {
				contract: nft.contract.address,
				collection: nft.contract.opensea?.collectionName,
				tokenId: nft.tokenId,
				title: nft.title,
				desc: nft.description,
				media: nft.media[0]?.gateway
					? nft.media[0].gateway
					: "https://via.placeholder.com/500",
				format: nft.media[0]?.format ? nft.media[0]?.format : "png"			
			}
		}

		res.status(200).json({
			nft: formattedNft ? formattedNft : null
		});
		
	} catch (err) {
		console.warn(err);
		res.status(500).send({
			message: err.message
		});
	} 
}
