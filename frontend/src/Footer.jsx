import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

function Footer() {
  return (
      <footer className="bg-gray-100 mt-5 pt-6 text-gray-600">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Support</h4>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Help Center</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Cancellation</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Contact</a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Hosting</h4>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Become a Vendor</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Community</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Rules</a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Attica</h4>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">About</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Careers</a>
              <a href="#" className="block text-sm hover:underline hover:text-gray-900">Blog</a>
            </div>
          </div>
        </div>
        <div className="bg-gray-200 mt-6 py-2 text-center text-sm flex justify-center items-center gap-2 border-t">
          <span>© {new Date().getFullYear()} Attica Inc.</span>
          <div className="flex gap-2">
            <FacebookIcon fontSize="small" className="hover:text-rose-500"/>
            <InstagramIcon fontSize="small" className="hover:text-rose-500"/>
            <TwitterIcon fontSize="small" className="hover:text-rose-500"/>
          </div>
        </div>
      </footer>
  )
}

export default Footer