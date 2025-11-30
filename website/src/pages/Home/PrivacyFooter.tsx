
import { Shield, Lock, Github, Twitter } from 'lucide-react';

export default function PrivacyFooter() {
  return (
    <>
      {/* Privacy Section */}
      <section id="privacy" className="py-24 bg-mory-text-primary text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <Lock size={32} className="text-mory-orange" />
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            彻底的隐私自由。
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-10">
            没有账号体系，没有云端同步，没有数据遥测。<br />
            你的 Vault 就在你的硬盘里，Mory 的记忆就在你的本地数据库里。<br />
            拔掉网线，它依然为你工作。
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-400">
             <span className="flex items-center gap-2"><Shield size={14} /> Local First Architecture</span>
             <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
             <span>Electron Store Storage</span>
             <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
             <span>No Analytics</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-gray-400 py-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Left */}
            <div className="flex items-center gap-3">
               <img 
                src="https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354271641.png?imageMogr2/format/webp" 
                alt="Logo" 
                className="w-6 h-6 opacity-50 grayscale"
              />
              <span className="text-sm">© 2025 Moryflow. All rights reserved.</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors text-sm">Version 0.1.0 Beta</a>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}
