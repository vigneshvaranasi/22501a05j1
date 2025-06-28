import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.page.tsx"
import ShortURL from "./pages/ShortURL.page.tsx"
import URLStat from "./pages/URLStat.page.tsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/short" element={<ShortURL />} />
      <Route path="/stats" element={<URLStat />} />
    </Routes>
  )
}

export default App