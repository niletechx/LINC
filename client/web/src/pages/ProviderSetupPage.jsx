import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProviderSetupPage() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('plumbing');
  const [headline, setHeadline] = useState('Master Plumber & Pipe Specialist');
  const [rate, setRate] = useState('350');
  const [city, setCity] = useState('Addis Ababa, Bole');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('available');

  const categories = [
    { id: '1', slug: 'plumbing', name: 'Plumbing & Water', emoji: '🔧', headline: 'Master Plumber & Pipe Specialist' },
    { id: '3', slug: 'electric', name: 'Electrical Work', emoji: '⚡', headline: 'Certified Electrician & Wiring Pro' },
    { id: '2', slug: 'cleaning', name: 'Cleaning & Maid', emoji: '🧹', headline: 'Professional Deep Cleaning Specialist' },
    { id: '4', slug: 'it-tech', name: 'IT & Computer', emoji: '💻', headline: 'Computer Repair & IT Technician' },
    { id: '5', slug: 'tutoring', name: 'Tutoring & Skills', emoji: '📚', headline: 'Experienced Academic & Language Tutor' },
    { id: '6', slug: 'transport', name: 'Transport & Cargo', emoji: '🚗', headline: 'Safe Driver & Moving Logistics Pro' },
    { id: '7', slug: 'wellness', name: 'Health & Wellness', emoji: '💆', headline: 'Certified Personal Trainer & Wellness Pro' },
    { id: '8', slug: 'creative', name: 'Painting & Design', emoji: '🎨', headline: 'Interior Painter & Decorating Specialist' },
  ];

  const locationSuggestions = [
    'Bole, Addis Ababa',
    'Kazanchis, Addis Ababa',
    'Sarbet, Addis Ababa',
    'CMC / Ayat, Addis Ababa',
    'Piassa / Arada, Addis Ababa',
    'Megenagna, Addis Ababa',
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.slug);
    if (!headline || categories.some(c => c.headline === headline)) {
      setHeadline(cat.headline);
    }
  };

  const handleSave = () => {
    navigate('/home');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Cyan Header */}
      <div className="bg-[#7EC8E3] px-4 pt-6 pb-5 w-full">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => navigate(-1)} className="w-[30px] h-[30px] flex justify-center items-center">
            <ChevronLeft size={24} className="text-[#0F172A] -ml-2" />
          </button>
          <button onClick={() => navigate('/home')} className="text-[#1E5F7A] font-bold text-[13px]">
            Skip for now
          </button>
        </div>
        <h1 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">Welcome, Provider! 💼</h1>
        <p className="text-[13px] text-[#1E5F7A] font-medium mt-1">
          Set up your professional profile to start getting service bookings.
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-12">
        {/* 1. SELECT TRADE / CATEGORY */}
        <SectionCard title="1. Primary Trade / Specialty" subtitle="Select the main type of service you provide">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <div 
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-2 rounded-[12px] border cursor-pointer flex items-center ${isSelected ? 'bg-[#7EC8E3] border-[#0284C7] border-[1.5px]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}
                >
                  <span className="text-[15px]">{cat.emoji}</span>
                  <span className={`ml-1.5 text-[12.5px] ${isSelected ? 'font-extrabold text-white' : 'font-semibold text-[#334155]'}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 2. PROFESSIONAL HEADLINE */}
        <SectionCard title="2. Professional Headline" subtitle="This will appear at the top of your profile card">
          <input 
            type="text" 
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-3 text-[14px] font-semibold text-[#0F172A] focus:border-[#7EC8E3] focus:outline-none"
            placeholder="e.g. Certified Electrician & Home Wiring Pro"
          />
        </SectionCard>

        {/* 3. HOURLY RATE & OPERATING LOCATION */}
        <SectionCard title="3. Rates & Operating Location" subtitle="Set your standard starting rate and location">
          <div className="flex gap-3">
            <div className="flex-5 flex flex-col">
              <label className="text-[12px] font-bold text-[#475569] mb-1.5">Hourly Rate (ETB)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[13px] font-extrabold text-[#059669]">ETB</span>
                <input 
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] pl-10 pr-8 py-3 text-[14px] font-bold text-[#0F172A] focus:border-[#7EC8E3] focus:outline-none"
                />
                <span className="absolute right-3 top-3.5 text-[12px] text-[#94A3B8]">/hr</span>
              </div>
            </div>
            <div className="flex-6 flex flex-col w-full">
              <label className="text-[12px] font-bold text-[#475569] mb-1.5">City / Sub-city</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#0F172A] focus:border-[#7EC8E3] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex overflow-x-auto gap-1.5 mt-2.5 hide-scrollbar">
            {locationSuggestions.map((loc, i) => (
              <div 
                key={i} 
                onClick={() => setCity(loc)}
                className="whitespace-nowrap px-2 py-1 bg-[#F1F5F9] rounded-[6px] text-[10.5px] font-semibold text-[#64748B] cursor-pointer"
              >
                {loc.split(',')[0]}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4. BIO & EXPERIENCE */}
        <SectionCard title="4. About Your Services & Experience" subtitle="Highlight your skills, background, tools, and response time">
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-3 text-[13.5px] text-[#0F172A] leading-relaxed resize-none focus:border-[#7EC8E3] focus:outline-none"
            placeholder="E.g. Certified technician with 6+ years experience in Addis Ababa. I carry modern diagnostic tools, offer quick same-day emergency repairs, and guarantee all my work with escrow safety."
            rows={4}
          ></textarea>
        </SectionCard>

        {/* 5. AVAILABILITY STATUS */}
        <SectionCard title="5. Initial Availability Status" subtitle="Clients can see when you are open for work">
          <div className="flex gap-2">
            <AvailabilityCard 
              id="available" 
              label="🟢 Available" 
              sub="Accepting jobs now" 
              selected={availability} 
              onSelect={setAvailability} 
            />
            <AvailabilityCard 
              id="busy" 
              label="🟡 Busy" 
              sub="Book in advance" 
              selected={availability} 
              onSelect={setAvailability} 
            />
          </div>
        </SectionCard>

        <button 
          onClick={handleSave}
          className="w-full h-[52px] mt-3 bg-[#0F172A] rounded-[14px] text-white text-[15px] font-extrabold flex justify-center items-center"
        >
          Save & Launch Provider Profile 🚀
        </button>

      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-[16px] p-4 flex flex-col">
      <h3 className="text-[14px] font-extrabold text-[#0F172A]">{title}</h3>
      <p className="text-[11.5px] text-[#64748B] mt-0.5 mb-3.5">{subtitle}</p>
      {children}
    </div>
  );
}

function AvailabilityCard({ id, label, sub, selected, onSelect }) {
  const isSelected = selected === id;
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`flex-1 px-2.5 py-3 rounded-[12px] border cursor-pointer ${isSelected ? 'bg-[#E0F2FE] border-[#38BDF8] border-[1.5px]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}
    >
      <div className="text-[13px] font-bold text-[#0F172A]">{label}</div>
      <div className="text-[10.5px] text-[#64748B] mt-0.5">{sub}</div>
    </div>
  );
}
