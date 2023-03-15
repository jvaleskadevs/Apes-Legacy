import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			
			<Link href="/">
				<div className={styles.logo_container}>
						<img className={styles.ape_coin_logo} src="/ape_coin.png"></img>
						<h1>
							Apes{" "}<span>Legacy</span>
						</h1>
				</div>
			</Link>
			
			<ConnectButton></ConnectButton>
		</nav>
	);
}
