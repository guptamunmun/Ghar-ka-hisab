import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/expenses', label: 'Expenses', icon: '🧾' },
  { to: '/budget', label: 'Budget', icon: '🎯' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  // { to: '/bills', label: 'Bills', icon: '📄' },
  { to: '/reports', label: 'Reports', icon: '📊' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="font-extrabold text-lg text-household-primaryDark">Ghar Ka Hisaab</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-household-primary text-white' : 'text-household-text hover:bg-household-bg'
                }`
              }
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-household-muted font-semibold">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="text-sm font-bold text-household-danger hover:underline">
            Logout
          </button>
        </div>
      </div>

      <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `whitespace-nowrap px-3 py-2 rounded-xl2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-household-primary text-white' : 'bg-household-bg text-household-text'
              }`
            }
          >
            <span className="mr-1">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
