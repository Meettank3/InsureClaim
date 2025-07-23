import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, User, Settings, LogOut, Wallet } from 'lucide-react';
import { useBlockchain } from '../../hooks/useBlockchain';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, connected, connectWallet, disconnect, loading, error } = useBlockchain();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Policies', href: '/', icon: Shield },
    { name: 'My Dashboard', href: '/dashboard', icon: User },
    ...(user?.isOwner ? [{ name: 'Admin Panel', href: '/admin', icon: Settings }] : [])
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">InsureChain</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {!connected ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.isOwner ? 'Admin' : 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: {parseFloat(user.balance).toFixed(4)} ETH
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </button>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* MetaMask Not Installed Warning */}
        {typeof window !== 'undefined' && !window.ethereum && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  MetaMask is not installed. Please{' '}
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-yellow-600"
                  >
                    install MetaMask
                  </a>{' '}
                  to use this application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;