import { Route, Routes } from "react-router"
import { FileProvider } from "./StateManager/FileContext"
import { TextExtractionContextProvider } from "./StateManager/TextExtraction"

// pages
import Home from './pages/Home/Home'

// componants
import Navbar from './componants/Navbar/Navbar'

import './App.css'
import Summary from "./pages/Summary/Summary"

function App() {

	return (
		<FileProvider>
			<div className="App">
				<Navbar />
				<TextExtractionContextProvider>
					<Routes>
							<Route path="/" Component={Home} />
							<Route path="/summary" Component={Summary} />
					</Routes>
				</TextExtractionContextProvider>
			</div>
		</FileProvider>
	)
}

export default App
