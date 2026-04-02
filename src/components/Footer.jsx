const Footer = () => {
  return (
    <footer className="bg-[#000000] border-t border-[#48474a]/15 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto space-y-4 md:space-y-0">
        <div className="text-lg font-bold text-[#f9f5f8] font-headline">Beacon</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-[#f9f5f8]/50 hover:text-[#f9f5f8] transition-colors duration-200 text-xs font-label uppercase tracking-widest underline-offset-4 hover:underline" href="#">Privacy Policy</a>
          <a className="text-[#f9f5f8]/50 hover:text-[#f9f5f8] transition-colors duration-200 text-xs font-label uppercase tracking-widest underline-offset-4 hover:underline" href="#">Terms of Service</a>
          <a className="text-[#f9f5f8]/50 hover:text-[#f9f5f8] transition-colors duration-200 text-xs font-label uppercase tracking-widest underline-offset-4 hover:underline" href="#">Security</a>
          <a className="text-[#f9f5f8]/50 hover:text-[#f9f5f8] transition-colors duration-200 text-xs font-label uppercase tracking-widest underline-offset-4 hover:underline" href="#">Status</a>
          <a className="text-[#f9f5f8]/50 hover:text-[#f9f5f8] transition-colors duration-200 text-xs font-label uppercase tracking-widest underline-offset-4 hover:underline" href="#">Contact Support</a>
        </div>
        <div className="text-[#f9f5f8]/50 text-xs font-body">
          © 2024 Beacon Quantum Intelligence. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
