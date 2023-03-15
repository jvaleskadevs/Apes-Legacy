import styles from "/styles/Home.module.css";
import ClaimComponent from "/components/ClaimComponent";

export default function ClaimLayout() {
  return (
    <div>
	  <main className={styles.main}>
        <ClaimComponent></ClaimComponent>
	  </main>
    </div>
  );
}
