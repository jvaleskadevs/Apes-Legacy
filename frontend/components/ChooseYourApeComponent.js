import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import Link from 'next/link';
import Header from '/components/Header'
export default function ChooseYourApeComponent() {
	const router = useRouter();
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<Header />
			</header>

			<div className={styles.buttons_container}>
				<Link
					href={"/apes/bayc"}
				>
					<div className={styles.button}>
						<p>BAYC</p>
						<img src="/bayc_logo.png" width={"30px"} height={"30px"} />
					</div>
				</Link>
				<Link
					href={"/apes/mayc"}
				>
					<div className={styles.button}>
						<p>MAYC</p>
						<img src="/mayc_logo.png" width={"30px"} height={"30px"} />
					</div>
				</Link>
				<Link
					href={"/apes/bakc"}
				>
					<div className={styles.button}>
						<p>BAKC</p>
						<img src="/bakc_logo.png" width={"40px"} height={"40px"} />
					</div>
				</Link>
			</div>
		</div>
	);
}
