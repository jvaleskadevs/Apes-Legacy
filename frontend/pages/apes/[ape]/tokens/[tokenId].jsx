import styles from "/styles/ApesLegacy.module.css";
import DisplayNftsComponent from "/components/DisplayNftsComponent";
import Header from '/components/Header';
export default function DisplayNftsLayout() {
  return (
    <div className={styles.container}>
		<header className={styles.header_container}>
			<Header />
		</header>
        <DisplayNftsComponent></DisplayNftsComponent>
    </div>
  );
}
