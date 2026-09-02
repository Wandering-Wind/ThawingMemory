import { Route, Routes } from 'react-router-dom'
import LivingArchivePage from './pages/LivingArchive/LivingArchivePage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import KitchenPage from './pages/Kitchen/KitchenPage.jsx'
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/kitchen" element={<KitchenPage />} />
      <Route path="/garden" element={<ComingSoonPage sectionName="Garden" />} />
      <Route path="/ritual" element={<ComingSoonPage sectionName="Ritual" />} />
      <Route path="/archive" element={<LivingArchivePage />} />
    </Routes>
  )
}

export default App
