import Navbar from "../components/navigation/navbar";
import Footer from "../components/Footer";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout({ children }) {
	return (
		<div>
            <Navbar />
            {children}
            <Footer />
			<ToastContainer
				position="top-center"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover={true}
				theme="dark"
			/>
		</div>
	);
}
