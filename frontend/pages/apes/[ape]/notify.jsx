import styles from "/styles/Home.module.css";
import NotifyComponent from "/components/NotifyComponent";

export default function NotifyLayout() {
  return (
    <div>
	  <main className={styles.main}>
        <NotifyComponent></NotifyComponent>
	  </main>
    </div>
  );
}
