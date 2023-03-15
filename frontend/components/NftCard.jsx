import styles from "../styles/DisplayNfts.module.css";
export default function NftCard({ nft }) {
  console.log(nft);
  return (
    <div className={styles.card_container}>
      <div className={styles.image_container}>
        <img src={nft.media}></img>
      </div>
      <div className={styles.info_container}>
        <div className={styles.title_container}>
          <h3>{nft.ape?.toUpperCase()} #{nft.tokenId}</h3>
        </div>
        {nft.deadline > 0 && (
        <>
        <hr className={styles.separator} />
        <div className={styles.symbol_contract_container}>

		  <div className={styles.symbol_contract_container}>
		    <p>Beneficiary: <b>{nft.beneficiary?.slice(0, 6)}...{nft.beneficiary?.slice(-4)}</b></p>
		  </div>

		  <div className={styles.symbol_contract_container}>
		    
		    <p>Claimable after: <b>{(new Date(nft.deadline * 1000)).toISOString().slice(0, 10)}</b></p>
		  </div>
        </div> 
	  </>
		  )}
      </div>
    </div>
  );
}
