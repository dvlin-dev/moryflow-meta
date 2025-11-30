
import { Mail } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function FooterNew() {
  return (
    <footer className="bg-mory-text-primary text-white py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logoSvg} 
                alt="Moryflow Logo" 
                className="w-8 h-8 opacity-80"
              />
              <span className="font-serif font-bold text-xl">Moryflow</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Mory，你的智能工作伙伴。<br />
              它会思考、会规划、会帮你完成任务。<br />
              而且，它只属于你一个人。
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">联系我们</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="mailto:hello@moryflow.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail size={16} />
                  hello@moryflow.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <div className="mb-2">
            © 2025 Moryflow. 保留所有权利
          </div>
          <div>
            Beta
          </div>
        </div>

      </div>
    </footer>
  );
}
