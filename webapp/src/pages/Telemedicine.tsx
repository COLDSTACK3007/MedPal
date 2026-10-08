import { Video, Phone, MessageCircle, ArrowRight } from 'lucide-react';

const Telemedicine = () => {
  const services = [
    { icon: <Video size={22} />, title: 'Video Consultation', desc: 'Connect face-to-face with specialists via HD video for detailed examinations and real-time diagnosis.', online: false, statusText: 'Coming Soon', color: 'text-brand-light', bg: 'bg-brand-glow' },
    { icon: <Phone size={22} />, title: 'Voice Call', desc: 'Low-bandwidth audio consultations optimized for areas with limited cellular or Wi-Fi connectivity.', online: false, statusText: 'Coming Soon', color: 'text-teal', bg: 'bg-teal-glow' },
    { icon: <MessageCircle size={22} />, title: 'Async Messaging', desc: 'Send detailed symptom reports with photos and receive expert guidance within 30 minutes.', online: false, statusText: 'Coming Soon', color: 'text-warning', bg: 'bg-warning-bg' },
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-info via-brand to-teal rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-white mb-2">Virtual Healthcare Access</h2>
          <p className="text-white/85 text-sm max-w-lg leading-relaxed">Connect with certified healthcare professionals through video, voice, or asynchronous messaging — designed for regions with limited medical infrastructure.</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {services.map((svc, idx) => (
          <div key={idx} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-border-focus hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-xl ${svc.bg} ${svc.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              {svc.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-txt mb-1.5">{svc.title}</h3>
              <p className="text-sm text-txt-secondary leading-relaxed">{svc.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${svc.online ? 'bg-success shadow-[0_0_6px_var(--color-success)]' : 'bg-txt-muted'}`} />
                <span className={svc.online ? 'text-success' : 'text-txt-muted'}>{svc.statusText}</span>
              </div>
              {svc.online && (
                <button className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-light transition-colors group-hover:translate-x-1">
                  Connect <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Telemedicine;
