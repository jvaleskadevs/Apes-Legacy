import styles from "/styles/Home.module.css";
import RegisterOrClaimComponent from "/components/RegisterOrClaimComponent";

export default function RegisterOrClaimLayout() {
  return (
    <div>
	  <main className={styles.main}>
        <RegisterOrClaimComponent></RegisterOrClaimComponent>
	  </main>
    </div>
  );
}
