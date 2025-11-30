import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import logoSvg from '@/assets/logo.svg'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToDownload = () => {
    const downloadSection = document.getElementById('download')
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 py-4',
        isScrolled ? 'pt-4' : 'pt-6'
      )}
    >
      <div
        className={cn(
          'max-w-7xl mx-auto rounded-2xl transition-all duration-300 flex items-center justify-between px-6 py-3',
          isScrolled ? 'glass-panel bg-white/70' : 'bg-transparent'
        )}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logoSvg}
            alt="Moryflow Logo"
            className="w-7 h-7 object-contain transition-transform group-hover:scale-110"
          />
          <span className="font-serif font-bold text-xl tracking-tight text-mory-text-primary group-hover:text-mory-orange transition-colors">
            Moryflow
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://docs.moryflow.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-mory-text-secondary hover:text-mory-orange transition-colors"
          >
            <BookOpen size={16} />
            <span>使用文档</span>
          </a>
          <button
            onClick={scrollToDownload}
            className="flex items-center gap-2 bg-mory-text-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={16} />
            <span>下载</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
