import { Route, Routes } from 'react-router-dom'
import LivingArchivePage from './pages/LivingArchive/LivingArchivePage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import KitchenPage from './pages/Kitchen/KitchenPage.jsx'
import GardenPage from './pages/Garden/GardenPage.jsx'
import RitualPage from './pages/Ritual/RitualPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/kitchen" element={<KitchenPage />} />
      <Route path="/garden" element={<GardenPage />} />
      <Route path="/ritual" element={<RitualPage />} />
      <Route path="/archive" element={<LivingArchivePage />} />
    </Routes>
  )
}

export default App
