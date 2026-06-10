import { NavLink } from 'react-router-dom'

function Navbar() {
  const base =
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors'

  const active =
    'bg-blue-600 text-white'

  const inactive =
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="text-2xl font-bold text-slate-900"
        >
          FinanceTracker
        </NavLink>

        <div className="flex flex-wrap gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Transactions
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Reports
          </NavLink>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Budgets
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Goals
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar