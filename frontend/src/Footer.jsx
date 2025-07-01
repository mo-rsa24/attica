import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

function Footer() {
  return (
      <footer className="bg-gray-800 text-white mt-5 pt-6 font-light" style={{minHeight: '100px'}}>

        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-2">Support</h4>
              <h4 className="text-sm font-semibold mb-2 font-serif">Support</h4>
              <a href="#" className="block text-sm hover:underline">Help Center</a>
              <a href="#" className="block text-sm hover:underline">Cancellation</a>
              <a href="#" className="block text-sm hover:underline">Contact</a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 font-serif">Hosting</h4>
              <a href="#" className="block text-sm hover:underline">Become a Vendor</a>
              <a href="#" className="block text-sm hover:underline">Community</a>
              <a href="#" className="block text-sm hover:underline">Rules</a>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 font-serif">Attica</h4>
              <a href="#" className="block text-sm hover:underline">About</a>
              <a href="#" className="block text-sm hover:underline">Careers</a>
              <a href="#" className="block text-sm hover:underline">Blog</a>
            </div>
          </div>
        </div>
        <div className="bg-gray-200 mt-6 py-2 text-center text-sm flex justify-center items-center gap-4 border-t">
          <span>© {new Date().getFullYear()} Attica Inc.</span>
          <div className="flex gap-3 text-gray-600">
            <FacebookIcon fontSize="small" className="hover:text-rose-500"/>
            <InstagramIcon fontSize="small" className="hover:text-rose-500"/>
            <TwitterIcon fontSize="small" className="hover:text-rose-500"/>
          </div>
        </div>
      </footer>
  )
}

export default Footer