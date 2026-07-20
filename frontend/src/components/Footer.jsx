import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-white/40 dark:bg-dark-card/20 border-t border-gray-100 dark:border-dark-border py-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-base">
                🌾
              </span>
              <span className="text-base font-extrabold font-poppins text-text-primary dark:text-white tracking-tight flex items-center gap-1">
                AgriStock <span className="text-primary font-black uppercase text-xs px-1.5 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20">AI</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm">
              AgriStock AI is an enterprise-grade agricultural intelligence platform. We use Machine Learning to predict local crop demand and mitigate yield risks across Indian states.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-text-primary dark:text-white font-poppins uppercase tracking-wider">
              Navigation
            </h4>
            <Link to="/" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Home</Link>
            <Link to="/prediction" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Prediction</Link>
            <Link to="/about" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Contact</Link>
          </div>

          {/* Community & Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-text-primary dark:text-white font-poppins uppercase tracking-wider">
              Connect
            </h4>
            <a href="mailto:support@agristock.ai" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">support@agristock.ai</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">GitHub</a>
            <span className="text-[10px] font-semibold text-olive-green dark:text-green-400 mt-2 bg-olive-green/5 dark:bg-green-950/20 px-3 py-1.5 rounded-xl self-start">
              Made with ❤️ for Indian Farmers
            </span>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-dark-border text-center sm:text-left">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
            © {year} AgriStock AI. All rights reserved.
          </p>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-poppins tracking-wider uppercase">
            Powering Agriculture with Artificial Intelligence
          </p>
        </div>

      </div>
    </footer>
  )
}
