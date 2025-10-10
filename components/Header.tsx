import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" opacity="0.3"/>
                <path d="M16.24 7.76C15.07 6.59 13.54 6 12 6C10.46 6 8.93 6.59 7.76 7.76C6.59 8.93 6 10.46 6 12C6 13.54 6.59 15.07 7.76 16.24C8.93 17.41 10.46 18 12 18C13.54 18 15.07 17.41 16.24 16.24C17.41 15.07 18 13.54 18 12C18 10.46 17.41 8.93 16.24 7.76ZM14.83 14.83C14.05 15.61 13.05 16 12 16C10.95 16 9.95 15.61 9.17 14.83C8.39 14.05 8 13.05 8 12C8 10.95 8.39 9.95 9.17 9.17C9.95 8.39 10.95 8 12 8C13.05 8 14.05 8.39 14.83 9.17C16.39 10.73 16.39 13.27 14.83 14.83Z" fill="currentColor"/>
            </svg>
            <h1 className="text-xl font-bold text-gray-800">Bizfly Cloud Cost Calculator</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;