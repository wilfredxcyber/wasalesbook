import { motion, useMotionTemplate, useMotionValue, animate } from 'motion/react';
import { useEffect, useState, MouseEvent } from 'react';

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  // Mouse position for glowing effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // A breathing gradient background
  const colors = ["#052e16", "#064e3b", "#022c22", "#000000"];
  const color = useMotionValue(colors[0]);
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #000000 50%, ${color})`;

  useEffect(() => {
    animate(color, colors, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  // Floating Mockup States
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    { title: "Personalized Branding", icon: "palette", desc: "Design receipts that match your brand identity perfectly.", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" },
    { title: "Digital Storefront", icon: "storefront", desc: "Launch a beautiful web store for your products in seconds.", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" },
    { title: "Direct Sales", icon: "chat", desc: "Customers order directly to your dashboard.", img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div
      style={{ backgroundImage }}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white px-4 selection:bg-[#25D366] selection:text-black"
    >
      {/* Background Glowing Textures */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(37, 211, 102, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#006d2f] to-[#25D366] flex items-center justify-center shadow-lg shadow-[#006d2f]/40">
             <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          </div>
          <span className="font-extrabold text-xl tracking-tighter">Whatsbook</span>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onClick={onGetStarted}
          className="px-6 py-2 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
        >
          Log in
        </motion.button>
      </div>

      <main 
        onMouseMove={handleMouseMove}
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 mt-16"
      >
        {/* Left Side: Hero Copy */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm mx-auto lg:mx-0"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Gemini 2.0 AI Integrated</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter"
          >
            Your business, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#fff]">
              vividly branded.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Transform your sales into a branded experience. Create personalized receipts, launch your instant storefront, and close deals directly with your customers. 
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="relative group w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-black bg-[#25D366] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-2">
                <span>Start Free Trial</span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full font-bold text-white bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 w-full sm:w-auto"
            >
              See how it works
            </button>
          </motion.div>
        </div>

        {/* Right Side: Interactive Bionic Mockup */}
        <div className="flex-1 w-full relative perspective-[1000px] flex items-center justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, rotateY: -20, rotateX: 20, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.4 }}
            whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
            className="relative w-[340px] h-[640px] rounded-[3rem] bg-black border-[8px] border-neutral-900 shadow-2xl overflow-hidden preserve-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* The screen inside the phone */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black z-0 flex flex-col">
              {/* Dynamic App UI Mockup */}
              <div className="flex-1 p-6 relative">
                 <div className="w-full flex justify-between items-center mb-10">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006d2f] to-[#25D366]" />
                   <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                     <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse delay-75" />
                   </div>
                 </div>

                 {/* Rotating feature cards inside the phone */}
                 <div className="space-y-4">
                   {features.map((feature, i) => {
                     const isActive = activeFeature === i;
                     return (
                       <motion.div 
                         key={i}
                         animate={{ 
                           opacity: isActive ? 1 : 0.4,
                           scale: isActive ? 1.05 : 1,
                           backgroundColor: isActive ? 'rgba(37,211,102,0.1)' : 'rgba(255,255,255,0.03)',
                           borderColor: isActive ? 'rgba(37,211,102,0.3)' : 'rgba(255,255,255,0.05)'
                         }}
                         className="p-3 rounded-2xl border backdrop-blur-sm transition-all duration-500 overflow-hidden"
                       >
                         {isActive && (
                           <motion.img 
                             initial={{ opacity: 0, scale: 1.1 }}
                             animate={{ opacity: 0.4, scale: 1 }}
                             src={feature.img} 
                             className="absolute inset-0 w-full h-full object-cover z-0"
                           />
                         )}
                         <div className="relative z-10">
                           <div className="flex items-center gap-3 mb-1">
                             <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-[#25D366] text-black' : 'bg-white/10 text-white'}`}>
                               <span className="material-symbols-outlined text-[14px]">{feature.icon}</span>
                             </div>
                             <h3 className={`font-bold text-[12px] ${isActive ? 'text-white' : 'text-neutral-400'}`}>{feature.title}</h3>
                           </div>
                           <motion.div 
                             initial={false}
                             animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                             className="overflow-hidden"
                           >
                             <p className="text-[10px] text-neutral-300 mt-1 leading-relaxed">{feature.desc}</p>
                           </motion.div>
                         </div>
                       </motion.div>
                     )
                   })}
                 </div>

                 {/* Floating Action Button */}
                 <motion.div 
                   animate={{ 
                     boxShadow: ['0px 0px 0px rgba(37,211,102,0)', '0px 0px 20px rgba(37,211,102,0.6)', '0px 0px 0px rgba(37,211,102,0)']
                   }}
                   transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute bottom-20 right-6 w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center cursor-pointer text-black z-20"
                 >
                   <span className="material-symbols-outlined">identity_platform</span>
                 </motion.div>
              </div>

               {/* Bottom Nav Bar Fake */}
              <div className="h-16 border-t border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-around px-2">
                <div className="w-8 h-8 rounded-full bg-white/20" />
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="w-8 h-8 rounded-full bg-white/5" />
              </div>
            </div>
          </motion.div>
          
          {/* Decorative elements behind phone */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full border-dashed z-[-1]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-white/5 rounded-[40%] z-[-2]"
          />
        </div>
      </main>

      {/* Feature Details Section */}
      <section id="features" className="w-full max-w-6xl mx-auto py-32 px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">Built for businesses that move fast.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Skip the manual data entry. We use bleeding-edge AI to instantly turn your physical notebooks and messages into organized ledgers.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { tag: "Brand Identity", icon: "palette", title: "Custom Receipts", body: "Go beyond generic. Use your custom colors, fonts, and stamps to make every receipt feel like your brand's home." },
            { tag: "Digital Presence", icon: "storefront", title: "Instant Storefront", body: "Turn your catalogue into a public link. Your customers can browse your products with premium Unsplash-grade visuals." },
            { tag: "Secure commerce", icon: "chat", title: "Direct Ordering", body: "Close sales faster. Our storefronts bridge the gap between browsing and buying with a direct line to your business." }
          ].map((feat, idx) => (
             <motion.div 
               key={idx}
               whileHover={{ y: -8 }}
               className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all overflow-hidden"
             >
               <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#25D366] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
               <div className="w-12 h-12 rounded-2xl bg-[#006d2f]/30 flex items-center justify-center text-[#25D366] mb-6 border border-[#25D366]/20 group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined">{feat.icon}</span>
               </div>
               <div className="text-[10px] font-bold tracking-widest text-[#25D366] uppercase mb-2">{feat.tag}</div>
               <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
               <p className="text-sm text-slate-400 leading-relaxed">{feat.body}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Footer / CTA CTA */}
      <footer className="w-full border-t border-white/10 bg-black py-16 relative z-10 text-center">
        <h2 className="text-3xl font-black text-white mb-6">Ready to ditch the notebook?</h2>
        <button 
           onClick={onGetStarted}
           className="px-10 py-4 rounded-full font-extrabold text-black bg-white hover:bg-slate-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-12"
        >
          Sign Up for Free
        </button>
        
        <div className="mt-20 flex justify-center">
          <div className="group relative px-6 py-3 rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all hover:border-[#25D366]/50 hover:bg-[#25D366]/5 shadow-xl">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#25D366]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            
            <p className="relative z-10 text-xs font-black tracking-[0.4em] uppercase">
              <span className="text-slate-400 group-hover:text-white transition-colors duration-300">made by </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-[#128C7E] group-hover:from-white group-hover:to-white transition-all duration-300">
                glacierstack
              </span>
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
