import { Link } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'

export const Header = () => {
  return (
    <header className="bg-secondary text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🏛️ Land Registry
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-primary transition">
            Dashboard
          </Link>
          <Link to="/lands" className="hover:text-primary transition">
            Lands
          </Link>
        </div>
        <ConnectWallet />
      </nav>
    </header>
  )
}

export default Header
