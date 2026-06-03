import { NavLink } from 'react-router-dom'

function Navbar() {
  const base = 'rounded-lg px-3 py-2 text-sm font-medium transition'

  const active =
    'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30'

  const inactive =
    'text-violet-200 hover:bg-violet-900/50 hover:text-white'

  return (
    <nav className="border-b border-fuchsia-500/20 bg-[#12091f]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <NavLink
          to="/"
          className="text-2xl font-bold text-white"
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