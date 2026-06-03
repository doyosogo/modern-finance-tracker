import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center opacity-45"
        style={{
          backgroundImage: "url('/background.jpg')",
          filter: 'blur(6px)',
          transform: 'scale(1.04)',
        }}
      />

      <div className="fixed inset-0 -z-20 bg-[#05030d]/65" />

      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-fuchsia-950/20 via-transparent to-[#05030d]" />

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      </main>
    </div>
  )
}

export default App