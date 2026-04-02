const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-[#0e0e10]/70 backdrop-blur-xl shadow-[0px_20px_40px_rgba(249,245,248,0.04)]">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tighter text-[#f9f5f8] font-headline">Beacon</div>
        <div className="hidden md:flex items-center space-x-12">
          <a className="text-[#85adff] font-bold border-b border-[#85adff]/30 text-sm font-label uppercase tracking-widest" href="#">Product</a>
          <a className="text-[#f9f5f8]/70 hover:text-[#85adff] transition-colors duration-300 text-sm font-label uppercase tracking-widest" href="#">Solutions</a>
          <a className="text-[#f9f5f8]/70 hover:text-[#85adff] transition-colors duration-300 text-sm font-label uppercase tracking-widest" href="#">Pricing</a>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-[#f9f5f8]/70 hover:text-[#85adff] transition-colors duration-300 font-label uppercase tracking-widest text-xs">Login</button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-bold text-sm scale-105 transition-transform duration-200">Sign Up</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
