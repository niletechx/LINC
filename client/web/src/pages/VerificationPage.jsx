import { useState } from 'react';
import { ChevronLeft, Check, UploadCloud, Camera, Info, ShieldCheck, FileText, UserSquare, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerificationPage() {
  const navigate = useNavigate();
  const [activeDoc, setActiveDoc] = useState(null);

  const docs = [
    { id: 'phone', icon: '📱', label: 'Phone Number', status: 'done', note: 'Verified via OTP' },
    { id: 'id', icon: '🪪', label: 'National ID / Passport', status: 'required', note: 'Clear photo, all 4 corners visible' },
    { id: 'photo', icon: '🤳', label: 'Profile Photo', status: 'required', note: 'Face clearly visible, no sunglasses' },
    { id: 'address', icon: '🏠', label: 'Address Proof', status: 'optional', note: 'Utility bill or bank statement (optional)' },
  ];

  const steps = [
    { label: 'Documents\nSubmitted', active: false, done: true },
    { label: 'Under\nReview', active: false, done: false },
    { label: 'Verified\n& Trusted', active: false, done: false },
  ];

  return (
    <div className="bg-[#F1F5F9] min-h-screen pb-8">
      {/* Header */}
      <header className="bg-[#7EC8E3] p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="text-[#1E5F7A]" size={24} />
        </button>
        <h1 className="text-[#0F172A] font-extrabold text-[16px] ml-1">Trust & Verification</h1>
      </header>

      {/* Top Banner */}
      <div className="bg-[#7EC8E3] px-5 pb-5">
        <div className="flex items-center">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#F59E0B]/15 border border-[#F59E0B]/25 flex justify-center items-center">
            <span className="text-[24px]">🛡️</span>
          </div>
          <div className="ml-3.5 flex-1">
            <h2 className="text-[16px] font-extrabold text-[#0F172A] tracking-tight">LINC Verified Badge</h2>
            <p className="text-[12px] text-[#1E5F7A] mt-1">Complete the steps below to earn your badge</p>
          </div>
        </div>
        
        <div className="mt-4 bg-white/30 border border-white/50 rounded-[10px] px-3.5 py-2.5">
          <p className="text-[12px] text-[#1E3A4A]">
            Verified providers get <span className="font-bold text-[#F59E0B]">3× more bookings</span> and appear at the top of every search result.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white px-5 py-4 mb-2">
        <h3 className="text-[12px] font-extrabold text-[#0F172A] tracking-[0.04em]">VERIFICATION PROGRESS</h3>
        
        <div className="relative mt-3.5">
          <div className="absolute top-[15px] left-[16.67%] right-[16.67%] h-[2px] bg-[#F1F5F9]"></div>
          <div className="flex relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-[30px] h-[30px] rounded-full flex justify-center items-center border ${step.done ? 'bg-[#10B981] border-[#10B981]' : step.active ? 'bg-[#7EC8E3] border-[#7EC8E3]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}>
                  {step.done ? (
                    <Check size={12} className="text-white" />
                  ) : (
                    <div className={`w-[7px] h-[7px] rounded-full ${step.active ? 'bg-white' : 'bg-[#CBD5E1]'}`}></div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  {step.label.split('\n').map((line, j) => (
                    <p key={j} className={`text-[10px] leading-tight ${step.active ? 'font-bold text-[#0F172A]' : 'font-normal text-[#94A3B8]'}`}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white mb-2">
        <div className="px-4 py-3.5 border-b border-[#F1F5F9]">
          <h3 className="text-[13px] font-extrabold text-[#0F172A]">Required Documents</h3>
        </div>
        
        {docs.map((doc, i) => {
          const isDone = doc.status === 'done';
          const isRequired = doc.status === 'required';
          const isActive = activeDoc === doc.id;

          return (
            <div key={i} className="flex flex-col">
              <div 
                onClick={() => !isDone && setActiveDoc(isActive ? null : doc.id)}
                className={`px-4 py-3.5 border-b border-[#F1F5F9] flex items-center ${isActive ? 'bg-[#FAFBFF]' : 'bg-white'} ${!isDone ? 'cursor-pointer' : ''}`}
              >
                <div className={`w-[36px] h-[36px] rounded-[11px] flex justify-center items-center text-[16px] ${isDone ? 'bg-[#D1FAE5]' : 'bg-[#F8FAFC]'}`}>
                  {doc.icon}
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-[13px] font-bold text-[#0F172A]">{doc.label}</h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{doc.note}</p>
                </div>
                <div className={`px-2 py-1 rounded-[5px] text-[10px] font-bold ${isDone ? 'bg-[#D1FAE5] text-[#059669]' : isRequired ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                  {isDone ? '✓ Done' : isRequired ? 'Needed' : 'Optional'}
                </div>
              </div>

              {isActive && !isDone && (
                <div className="bg-[#F8FBFF] px-4 py-3.5 border-b border-[#F1F5F9]">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[10px] py-3.5 flex flex-col items-center">
                      <UploadCloud size={20} className="text-[#0284C7]" />
                      <span className="text-[11px] font-bold text-[#0284C7] mt-1">Upload File</span>
                    </button>
                    <button className="flex-1 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[10px] py-3.5 flex flex-col items-center">
                      <Camera size={20} className="text-[#0284C7]" />
                      <span className="text-[11px] font-bold text-[#0284C7] mt-1">Take Photo</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Info size={12} className="text-[#94A3B8]" />
                    <p className="text-[10.5px] text-[#94A3B8]">Documents are encrypted and never shared publicly.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="bg-white px-4 py-3.5 mb-2 flex items-center">
        <span className="text-[20px]">🔒</span>
        <p className="ml-2.5 flex-1 text-[11.5px] text-[#64748B] leading-relaxed">
          All documents are <span className="font-bold text-[#334155]">end-to-end encrypted</span> and reviewed only by LINC's trust & safety team.
        </p>
      </div>

      <div className="px-4 mt-6">
        <button className="w-full bg-[#0F172A] rounded-[14px] py-3.5 flex justify-center items-center text-[14px] font-extrabold text-white">
          Submit for Review
        </button>
      </div>
    </div>
  );
}
