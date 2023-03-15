import styles from "../styles/Home.module.css";
import ChooseYourApeComponent from "../components/ChooseYourApeComponent";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <ChooseYourApeComponent></ChooseYourApeComponent>
      </main>
    </div>
  );
}
