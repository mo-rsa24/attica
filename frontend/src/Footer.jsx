import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

function Footer() {
    return (
        <footer className='bg-gradient-to-r from-[#FF7F50] via-pink-300 to-white text-gray-900'>
            <div className='h-1 w-full bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500 opacity-70'/>
            {/* Top section: Links */}
            <div className='max-w-screen-xl mx-auto py-14 px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10'>
                <div>
                    <h3 className='text-xl font-semibold mb-5 tracking-tight'>Support</h3>
                    <ul className='space-y-3 text-base'>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Help
                                Center</a>
                        </li>
                        <li>
                            <a href='#'
                               className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Cancellation</a>
                        </li>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Contact
                                Us</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className='text-xl font-semibold mb-5 tracking-tight'>Hosting</h3>
                    <ul className='space-y-3 text-base'>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Become a
                                Vendor</a>
                        </li>
                        <li>
                            <a href='#'
                               className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Community</a>
                        </li>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Rules &
                                Policies</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className='text-xl font-semibold mb-5 tracking-tight'>Attica</h3>
                    <ul className='space-y-3 text-base'>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>About
                                Us</a>
                        </li>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Careers</a>
                        </li>
                        <li>
                            <a href='#' className='hover:text-pink-700 transition-all hover:translate-x-0.5'>Blog</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className='text-xl font-semibold mb-5 tracking-tight'>Stay Connected</h3>
                    <p className='text-base mb-5 leading-relaxed'>
                        Subscribe to our newsletter for updates and news.
                    </p>
                    <form className='flex'>
                        <input
                            type='email'
                            placeholder='Your email'
                            className='w-full px-4 py-3 rounded-l-lg bg-white/90 text-gray-900 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm'
                        />
                        <button
                            type='submit'
                            className='px-5 py-3 bg-pink-500 hover:bg-pink-600 rounded-r-lg text-white font-semibold transition-colors shadow-sm'
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom section: Copyright and Social */}
            <div className='border-t border-pink-200/80 py-7 bg-white/40 backdrop-blur'>
                <div className='max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center px-8'>
                    <p className='text-base font-medium'>© {new Date().getFullYear()} Attica Inc. All rights
                        reserved.</p>
                    <div className='flex space-x-5 mt-4 sm:mt-0'>
                        <a href='#'
                           className='p-2.5 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors shadow-sm'>
                            <FacebookIcon fontSize='medium'/>
                        </a>
                        <a href='#'
                           className='p-2.5 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors shadow-sm'>
                            <InstagramIcon fontSize='medium'/>
                        </a>
                        <a href='#'
                           className='p-2.5 bg-white rounded-full text-pink-500 hover:bg-pink-500 hover:text-white transition-colors shadow-sm'>
                            <TwitterIcon fontSize='medium'/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
