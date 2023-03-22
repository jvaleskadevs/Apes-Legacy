import styles from "/styles/ApesLegacy.module.css";
import Router, { useRouter } from "next/router";
import Link from 'next/link';
import Header from '/components/Header';
export default function RegisterOrClaimComponent() {
	const router = useRouter();
	const ape = router.asPath.split('/')[2];
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<Header />
			</header>

			<div className={styles.buttons_container}>
				<Link
					href={{
						pathname: '/apes/[ape]/tokens/select',
						query: { ape: ape }
					}}
				>
					<div className={styles.button}>
						<p>REGISTER</p>
					</div>
				</Link>
				<Link
					href={{
						pathname: '/apes/[ape]/claim',
						query: { ape: ape }
					}}
				>
					<div className={styles.button}>
						<p>CLAIM</p>
					</div>
				</Link>
				<Link
					href={{
						pathname: '/apes/[ape]/notify',
						query: { ape: ape }
					}}
				>
					<div className={styles.button}>
						<p>NOTIFY</p>
					</div>
				</Link>
			</div>
		</div>
	);
}
