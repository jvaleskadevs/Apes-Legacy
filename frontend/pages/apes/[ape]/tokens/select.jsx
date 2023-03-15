import styles from "/styles/InstructionsComponent.module.css";
import DisplayNftsComponent from "/components/DisplayNftsComponent";

export default function DisplayNftsLayout() {
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
        <DisplayNftsComponent></DisplayNftsComponent>
    </div>
  );
}
