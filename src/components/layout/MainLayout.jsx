import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useCrimeData } from '../../hooks/useCrimeData';

export const MainLayout = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const { firs } = useCrimeData();

  return (
    <div className="gov-bg-container flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar searchFilter={searchFilter} setSearchFilter={setSearchFilter} firs={firs} />

        <main className="flex-1 p-6 overflow-y-auto relative">
          <div className="relative z-10 space-y-6">
            <Outlet context={{ searchFilter, setSearchFilter }} />
          </div>
        </main>
      </div>
    </div>
  );
};





