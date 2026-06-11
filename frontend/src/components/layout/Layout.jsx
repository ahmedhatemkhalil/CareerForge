import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar/Sidebar.jsx'
import MobileSidebar from './MobileSidebar'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden h-full lg:flex">
        <Sidebar />
      </div>

      <MobileSidebar>
        <main className="min-h-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </main>
        <Footer />
      </MobileSidebar>
    </div>
  )
}

export default Layout
