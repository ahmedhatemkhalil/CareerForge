import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const shell =
  'mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12'

 const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className={shell}>
        <Navbar />
      </div>
      <main className="flex-1 w-full">
        <div className={`${shell} py-6 sm:py-8 lg:py-10`}>
          <Outlet />
        </div>
      </main>
      <div className={`${shell} mt-auto pb-6 pt-8 sm:pb-8 sm:pt-10`}>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
