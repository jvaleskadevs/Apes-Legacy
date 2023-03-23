import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import {
	//mainnet,
	//polygon,
	//optimism,
	//arbitrum,
	goerli,
	//polygonMumbai,
	//optimismGoerli,
	//arbitrumGoerli,
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { PolybaseProvider, AuthProvider } from "@polybase/react";
import { Auth } from '@polybase/auth';
import { Polybase } from "@polybase/client";
import MainLayout from "../layout/mainLayout";

const { chains, provider } = configureChains(
	[
		//mainnet,
		goerli,
		//polygon,
		//polygonMumbai,
		//optimism,
		//optimismGoerli,
		//arbitrum,
		//arbitrumGoerli,
	],
	[alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "InheritApes",
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

const polybase = new Polybase({
	defaultNamespace: "pk/0xb2de1a71c3b4ae98f578719241d1616e37dab9794ae430e12146c6b220df491adda19ac770387df81d6389099f580e4b63f2e349769afeceb657076fc9e6b19e/apes-legacy"
});

const auth = typeof window !== "undefined" ? new Auth() : null;

export { WagmiConfig, RainbowKitProvider };
function MyApp({ Component, pageProps }) {
	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider
				modalSize="compact"
				initialChain={process.env.NEXT_PUBLIC_DEFAULT_CHAIN}
				chains={chains}
			>
				<PolybaseProvider polybase={polybase}>
					<AuthProvider auth={auth} polybase={polybase}>
						<MainLayout>
							<Component {...pageProps} />
						</MainLayout>
					</AuthProvider>
				</PolybaseProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	);
}

export default MyApp;
