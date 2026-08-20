import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { MOCK_PROVIDERS } from '../data/mockData';

export default function BookingFlowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  
  const [selectedService, setSelectedService] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    // Simulate API fetch
    const p = MOCK_PROVIDERS.find(p => p.id === id) || MOCK_PROVIDERS[0];
    setProvider(p);
    setLoading(false);
  }, [id]);

  const handleConfirm = () => {
    if (!selectedTime) return;
    setConfirmed(true);
  };

  if (loading || !provider) {
    return (
      <div className="bg-[#F1F5F9] min-h-screen">
        <header className="bg-[#7EC8E3] p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white font-extrabold text-[16px] ml-1">Book Service</h1>
        </header>
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    const activeSvc = provider.services?.[selectedService] || { name: provider.headline };
    return (
      <div className="bg-[#F1F5F9] min-h-screen flex flex-col">
        <header className="bg-[#7EC8E3] p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white font-extrabold text-[16px] ml-1">Book Service</h1>
        </header>
        
        <div className="bg-[#7EC8E3] w-full px-7 py-5 flex flex-col items-center">
          <div className="w-[60px] h-[60px] rounded-full bg-[#10B981] flex justify-center items-center">
            <Check className="text-white" size={30} />
          </div>
          <h2 className="text-[20px] font-extrabold text-white mt-3">Booking Confirmed!</h2>
          <p className="text-[13px] text-[#1E5F7A] mt-2">Your provider has been notified.</p>
        </div>

        <div className="bg-white mb-2 pb-2">
          <SummaryRow label="Service" value={activeSvc.name} />
          <SummaryRow label="Date" value={`Aug ${16 + selectedDay}`} />
          <SummaryRow label="Time" value={selectedTime || ''} />
          <SummaryRow label="Payment" value={paymentMethod === 'cash' ? 'Cash on Delivery' : 'Escrow (Safe Pay)'} />
        </div>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => navigate('/bookings')}
            className="w-full h-[50px] bg-[#0F172A] rounded-[14px] text-white text-[14px] font-extrabold flex justify-center items-center"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const days = ['Today\nAug 16','Sun\nAug 17','Mon\nAug 18','Tue\nAug 19','Wed\nAug 20','Thu\nAug 21'];
  const times = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
  const bookedTimes = ['11:00 AM','4:00 PM'];

  const activeSvc = provider.services?.[selectedService] || { name: provider.headline, price: provider.price || '350 ETB' };

  return (
    <div className="bg-[#F1F5F9] min-h-screen pb-[60px]">
      <header className="bg-[#7EC8E3] p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h1 className="text-white font-extrabold text-[16px] ml-1">Book Service</h1>
      </header>

      {/* Provider Mini Card */}
      <div className="bg-[#7EC8E3] px-5 pb-5 flex items-center">
        <div className="w-[44px] h-[44px] rounded-[14px] flex justify-center items-center text-white text-[16px] font-extrabold" style={{ backgroundColor: provider.avatarColor || '#F59E0B' }}>
          {provider.name.charAt(0)}
        </div>
        <div className="ml-3 flex-1">
          <h2 className="text-[14px] font-extrabold text-white flex items-center">{provider.name} <span className="ml-1 text-[12px]">🛡️</span></h2>
          <p className="text-[11.5px] text-[#1E5F7A] line-clamp-1">{provider.headline}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[12px] font-bold text-[#F59E0B]">★ {provider.rating || '4.9'}</span>
          <span className="text-[11px] text-[#1E5F7A]">{provider.distance || '1.2 km'}</span>
        </div>
      </div>

      {/* Select Service */}
      {provider.services && provider.services.length > 0 && (
        <div className="bg-white mb-2">
          <div className="px-4 py-3.5 border-b border-[#E2E8F0]">
            <h3 className="text-[13px] font-extrabold text-[#0F172A]">Select Service</h3>
          </div>
          {provider.services.map((svc, i) => {
            const isSelected = selectedService === i;
            const isLast = i === provider.services.length - 1;
            return (
              <div 
                key={i}
                onClick={() => setSelectedService(i)}
                className={`px-4 py-3.5 flex items-center cursor-pointer ${isSelected ? 'bg-[#FAFBFF]' : 'bg-white'} ${!isLast ? 'border-b border-[#E2E8F0]' : ''}`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex justify-center items-center ${isSelected ? 'border-[#7EC8E3]' : 'border-[#CBD5E1]'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#7EC8E3]"></div>}
                </div>
                <div className="ml-2.5 flex-1">
                  <h4 className="text-[13px] font-bold text-[#0F172A]">{svc.name}</h4>
                  <p className="text-[11px] text-[#94A3B8]">{svc.duration}</p>
                </div>
                <div className={`text-[13px] font-extrabold ${isSelected ? 'text-[#7EC8E3]' : 'text-[#334155]'}`}>
                  {svc.price}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Select Date */}
      <div className="bg-white px-4 py-3.5 mb-2">
        <h3 className="text-[13px] font-extrabold text-[#0F172A] mb-3">Select Date</h3>
        <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
          {days.map((day, i) => {
            const isSelected = selectedDay === i;
            const lines = day.split('\n');
            return (
              <div 
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`w-[56px] min-w-[56px] py-2.5 px-1 rounded-[12px] flex flex-col items-center cursor-pointer ${isSelected ? 'bg-[#7EC8E3]' : 'bg-[#F1F5F9]'}`}
              >
                <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#94A3B8]'}`}>{lines[0]}</span>
                <span className={`text-[12px] font-extrabold mt-1 ${isSelected ? 'text-white' : 'text-[#334155]'}`}>{lines[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Select Time */}
      <div className="bg-white px-4 py-3.5 mb-2">
        <h3 className="text-[13px] font-extrabold text-[#0F172A] mb-3">Select Time</h3>
        <div className="grid grid-cols-4 gap-2">
          {times.map((t, i) => {
            const isBooked = bookedTimes.includes(t);
            const isSelected = selectedTime === t;
            return (
              <div 
                key={i}
                onClick={!isBooked ? () => setSelectedTime(t) : undefined}
                className={`flex justify-center items-center py-2 rounded-[10px] ${isBooked ? 'bg-[#F8FAFC]' : isSelected ? 'bg-[#7EC8E3]' : 'bg-[#F1F5F9] cursor-pointer'}`}
              >
                <span className={`text-[11.5px] ${isSelected ? 'font-extrabold text-white' : 'font-medium'} ${isBooked ? 'text-[#CBD5E1] line-through' : !isSelected ? 'text-[#334155]' : ''}`}>
                  {t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="bg-white px-4 py-3.5 mb-2">
        <div className="flex items-center mb-2">
          <h3 className="text-[13px] font-extrabold text-[#0F172A]">Note</h3>
          <span className="text-[12px] font-medium text-[#94A3B8] ml-1">(optional)</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="E.g. The leak is under the sink..."
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3 text-[13px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#7EC8E3] focus:outline-none resize-none"
          rows={3}
        ></textarea>
      </div>

      {/* Payment Method */}
      <div className="bg-white px-4 py-3.5 mb-2">
        <h3 className="text-[13px] font-extrabold text-[#0F172A] mb-3">Payment Method</h3>
        <div className="flex gap-2">
          <PaymentCard id="cash" emoji="💵" label="Cash on Delivery" selected={paymentMethod} onSelect={setPaymentMethod} />
          <PaymentCard id="escrow" emoji="🔒" label="Escrow (Safe Pay)" selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white mb-2">
        <div className="px-4 py-3.5 border-b border-[#E2E8F0]">
          <h3 className="text-[13px] font-extrabold text-[#0F172A]">Price Summary</h3>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-[12.5px] text-[#64748B]">{activeSvc.name}</span>
          <span className="text-[13px] font-bold text-[#334155]">{activeSvc.price}</span>
        </div>
        <div className="px-4 pb-3 flex justify-between">
          <span className="text-[12.5px] text-[#64748B]">LINC service fee (5%)</span>
          <span className="text-[13px] font-bold text-[#334155]">~15 ETB</span>
        </div>
      </div>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-[#E2E8F0] h-[54px] z-50">
        <button 
          onClick={handleConfirm}
          disabled={!selectedTime}
          className={`w-full h-full flex justify-center items-center text-[14px] ${selectedTime ? 'bg-[#7EC8E3] font-extrabold text-white' : 'bg-[#E2E8F0] font-semibold text-[#94A3B8]'}`}
        >
          {selectedTime ? `Confirm Booking · ${activeSvc.price}` : 'Select a time to continue'}
        </button>
      </div>

    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="px-5 py-3 border-b border-[#E2E8F0] flex justify-between items-center">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className="text-[13px] font-bold text-[#334155]">{value}</span>
    </div>
  );
}

function PaymentCard({ id, emoji, label, selected, onSelect }) {
  const isSelected = selected === id;
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`flex-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-[12px] border-[1.5px] cursor-pointer ${isSelected ? 'bg-[#E0F2FE] border-[#38BDF8]' : 'bg-[#F8FAFC] border-transparent'}`}
    >
      <span className="text-[20px]">{emoji}</span>
      <span className={`text-[11.5px] font-bold mt-1.5 text-center ${isSelected ? 'text-[#0284C7]' : 'text-[#475569]'}`}>{label}</span>
    </div>
  );
}
