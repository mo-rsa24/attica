import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

function Footer() {
  return (
    <footer className='bg-gradient-to-r from-[#FF7F50] via-pink-300 to-white text-gray-900'>
      {/* Top section: Links */}
      <div className='max-w-screen-xl mx-auto py-12 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
        <div>
          <h3 className='text-lg font-semibold mb-4'>Support</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Help Center</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Cancellation</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Contact Us</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='text-lg font-semibold mb-4'>Hosting</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Become a Vendor</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Community</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Rules & Policies</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='text-lg font-semibold mb-4'>Attica</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>About Us</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Careers</a>
            </li>
            <li>
              <a href='#' className='hover:text-pink-600 transition-colors'>Blog</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='text-lg font-semibold mb-4'>Stay Connected</h3>
          <p className='text-sm mb-4'>Subscribe to our newsletter for updates and news.</p>
          <form className='flex'>
            <input
              type='email'
              placeholder='Your email'
              className='w-full px-3 py-2 rounded-l-md bg-white text-gray-900 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent'
            />
            <button
              type='submit'
              className='px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-r-md text-white font-medium transition-colors'
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom section: Copyright and Social */}
      <div className='border-t border-pink-200 py-6'>
        <div className='max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6'>
          <p className='text-sm'>© {new Date().getFullYear()} Attica Inc. All rights reserved.</p>
          <div className='flex space-x-4 mt-4 sm:mt-0'>
            <a href='#' className='p-2 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors'>
              <FacebookIcon fontSize='small' />
            </a>
            <a href='#' className='p-2 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors'>
              <InstagramIcon fontSize='small' />
            </a>
            <a href='#' className='p-2 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors'>
              <TwitterIcon fontSize='small' />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
