{/* Research Resources */}
              <div className="space-y-6">
                <h4 className="font-bold text-xl sm:text-2xl lg:text-3xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Research Resources
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm sm:text-base text-gray-300 hover:text-white transition-all duration-200 flex items-center space-x-3 group py-2 px-3 rounded-lg hover:bg-white/5">
                      <FaBookOpen className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                      <span>Publication Guidelines</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm sm:text-base text-gray-300 import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaLinkedinIn,
  FaYoutube,
  FaGithub,
  FaGraduationCap,
  FaBookOpen,
  FaUsers,
  FaNewspaper,
  FaCalendarAlt,
  FaChartLine
} from "react-icons/fa"; 
 
function Footer() { 
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Terms of Use", href: "#", icon: FaBookOpen },
    { name: "Privacy Policy", href: "#", icon: FaUsers },
    { name: "Help & Support", href: "#", icon: FaGraduationCap },
    { name: "Contact Admin", href: "#", icon: FaEnvelope },
  ];

  const socialLinks = [
    { 
      name: "Facebook", 
      icon: FaFacebookF, 
      href: "https://www.facebook.com", 
      color: "hover:text-blue-400",
      bgColor: "hover:bg-blue-400/10"
    },
    { 
      name: "Instagram", 
      icon: FaInstagram, 
      href: "https://www.instagram.com", 
      color: "hover:text-pink-400",
      bgColor: "hover:bg-pink-400/10"
    },
    { 
      name: "Twitter", 
      icon: FaTwitter, 
      href: "https://www.twitter.com", 
      color: "hover:text-blue-300",
      bgColor: "hover:bg-blue-300/10"
    },
    { 
      name: "LinkedIn", 
      icon: FaLinkedinIn, 
      href: "https://www.linkedin.com", 
      color: "hover:text-blue-500",
      bgColor: "hover:bg-blue-500/10"
    },
    { 
      name: "YouTube", 
      icon: FaYoutube, 
      href: "https://www.youtube.com", 
      color: "hover:text-red-400",
      bgColor: "hover:bg-red-400/10"
    },
    { 
      name: "GitHub", 
      icon: FaGithub, 
      href: "https://www.github.com", 
      color: "hover:text-gray-300",
      bgColor: "hover:bg-gray-300/10"
    },
  ];

  const researchStats = [
    { icon: FaNewspaper, value: "500+", label: "Research Papers" },
    { icon: FaUsers, value: "1200+", label: "Active Researchers" },
    { icon: FaCalendarAlt, value: "50+", label: "Conferences" },
    { icon: FaChartLine, value: "98%", label: "Success Rate" },
  ];

  return ( 
    <> 
      <footer className="bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-grid)" />
          </svg>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">

            {/* Research Statistics Banner */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-12 border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Our Research Impact</h3>
                <p className="text-gray-300 text-sm sm:text-base">Driving innovation through collaborative research</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {researchStats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors duration-300">
                      <stat.icon className="text-xl text-blue-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
              
              {/* Contact Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Contact Information
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 group">
                    <FaMapMarkerAlt className="text-blue-400 mt-1 group-hover:text-blue-300 transition-colors duration-200" />
                    <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      <p className="font-medium text-white">Computer Science and Engineering</p>
                      <p>University of Chittagong</p>
                      <p>Hathazari, Chittagong</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 group">
                    <FaPhone className="text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                    <a 
                      href="tel:01842308102" 
                      className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      01842308102
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3 group">
                    <FaEnvelope className="text-purple-400 group-hover:text-purple-300 transition-colors duration-200" />
                    <a 
                      href="mailto:universityresearchcell@.edu" 
                      className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 break-all"
                    >
                      universityresearchcell@.edu
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="font-bold text-xl sm:text-2xl lg:text-3xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={index}>
                        <a 
                          href={link.href}
                          className="text-sm sm:text-base text-gray-300 hover:text-white transition-all duration-200 flex items-center space-x-3 group py-2 px-3 rounded-lg hover:bg-white/5"
                        >
                          <IconComponent className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                          <span>{link.name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Social Media */}
              <div className="space-y-6">
                <h4 className="font-bold text-xl sm:text-2xl lg:text-3xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Follow Us
                </h4>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${social.bgColor}`}
                        aria-label={social.name}
                      >
                        <IconComponent className={`text-lg sm:text-xl text-gray-300 ${social.color} transition-all duration-200`} />
                      </a>
                    );
                  })}
                </div>

                {/* Newsletter Signup */}
                <div className="mt-8 p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h5 className="font-semibold text-base sm:text-lg mb-3">Stay Updated</h5>
                  <p className="text-sm text-gray-300 mb-4">Get the latest research updates delivered to your inbox.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Bottom Section */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                © {currentYear} University Research Cell. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-400">
                <span>Made with</span>
                <span className="text-red-400 animate-pulse">♥</span>
                <span>for researchers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </> 
  ); 
} 
 
export default Footer;
