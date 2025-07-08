import { FaTelegram, FaGithub, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-4 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Description */}
        <div>
          <h2 className="text-xl font-bold text-blue-400 mb-2">
            ArcadeINDIA - Trusted Arcade Points Calculator: <br />
            <span className="text-blue-300">Play, Track & Win Prizes</span>
          </h2>
          <p className="text-slate-400">
            {/* To effortlessly track your arcade points, monitor milestone progress, view badge summaries, and stay updated with all the latest Google Cloud Arcade announcements. Everything you need, all in one intuitive platform. */}
          </p>
        </div>
        {/* Important Links */}
        <div>
          <h3 className="font-bold text-white mb-2">Important Links</h3>
          <ul className="space-y-1">
            <li>
              <button
                className="hover:text-blue-400 bg-transparent border-none p-0 m-0 text-inherit cursor-pointer"
                onClick={() => onNavigate && onNavigate("calculator")}
              >
                Points Calculator
              </button>
            </li>
            <li>
              <button
                className="hover:text-blue-400 bg-transparent border-none p-0 m-0 text-inherit cursor-pointer"
                onClick={() => onNavigate && onNavigate("about")}
              >
                About The Arcade
              </button>
            </li>
          </ul>
        </div>
        {/* Communities */}
        <div>
          <h3 className="font-bold text-white mb-2">Join Communities</h3>
          <ul className="space-y-1">
            <li><a href="https://chat.whatsapp.com/CWRtaQp4VYX5fGiLiqv7Ug?mode=r_t" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">WhatsApp Community</a></li>
            <li><a href="https://www.googlecloudcommunity.com/gc/Learning-Forums/bd-p/cloud-learning-certification" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Google Cloud Community</a></li>
            <li><a href="https://www.cloudskillsboost.google/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Cloud Skills Boost</a></li>
            <li><a href="https://go.cloudskillsboost.google/arcade" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Official Arcade Page</a></li>
          </ul>
        </div>
        {/* Social Icons */}
        <div>
          <h3 className="font-bold text-white mb-2">Connect With Us On Any Platform</h3>
          <div className="flex space-x-4 text-2xl mt-2">
            <a href="http://t.me/Manishchauhan2107" aria-label="Telegram" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
            <a href="https://github.com/manish930s" aria-label="GitHub" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/manish2111/" aria-label="LinkedIn" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://x.com/Manish664489?t=GHsx07p5j99YrqjQQ2f2ow&s=09" aria-label="Twitter" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://www.facebook.com/profile.php?id=100051760954089" aria-label="Facebook" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://www.instagram.com/mr__manish__2004_/" aria-label="Instagram" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <hr className="my-6 border-slate-700" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <span>© 2025 All rights reserved.</span>
        <span className="mt-2 md:mt-0">Explore All Features</span>
        <span>
          Made with <span className="text-red-500">♥</span> by <a href="https://manishchauhan.vercel.app/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Manish Chauhan</a>
        </span>
      </div>
    </footer>
  );
} 