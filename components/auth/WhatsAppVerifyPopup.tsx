"use client";

import { useEffect, useState } from "react";

interface WhatsAppVerifyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function WhatsAppVerifyPopup({ isOpen, onClose, userId }: WhatsAppVerifyPopupProps) {
  const [waLink, setWaLink] = useState("");
  const [waCode, setWaCode] = useState("");
  const [pollingStatus, setPollingStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const initializeWhatsAppAuth = async () => {
      setLoading(true);
      setPollingStatus("Generating secure link...");
      
      try {
        const res = await fetch("/api/auth/whatsapp/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          setWaLink(data.wa_link);
          setWaCode(data.code);
          setPollingStatus("Waiting for WhatsApp message...");
          
          let tickCount = 0;
          pollInterval = setInterval(async () => {
            tickCount++;
            
            try {
              const pollRes = await fetch("/api/auth/whatsapp/poll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: data.code }),
              });
              
              const pollData = await pollRes.json();

              if (pollData.status === "verified") {
                clearInterval(pollInterval);
                setPollingStatus("Phone Verified Successfully! 🎉");
                
                setTimeout(() => {
                  onClose();
                  window.location.reload();
                }, 2000);
                return;
              }
            } catch (err) {}

            if (tickCount > 180) {
              clearInterval(pollInterval);
              setPollingStatus("Verification timeout. Try again.");
            }
          }, 1000);
        }
      } catch (error) {
        console.error("WhatsApp Init Error:", error);
        setPollingStatus("Failed to load. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      initializeWhatsAppAuth();
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      setWaLink("");
      setWaCode("");
      setPollingStatus("");
    };
  }, [isOpen, userId, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300 opacity-100 pointer-events-auto"
        onClick={onClose}
      ></div>

      {/* Edge-to-Edge Bottom Sheet Container (Same size as FastAuthPopup) */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-400 ease-out flex justify-center translate-y-0">
        <div className="w-full sm:max-w-sm bg-white rounded-t-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.15)] pt-3 pb-6 px-4 flex flex-col items-center text-center relative border-t border-gray-100">
          
          {/* Top Handle Bar */}
          <div className="w-10 h-1.5 bg-[#E5E7EB] rounded-full mb-4"></div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* MAIN CONTAINER: Flex row grid layout */}
          <div className="flex items-center justify-between w-full mt-3 mb-2 px-1">
            
            {/* LEFT SIDE: Brand Logo + Custom Subtext */}
            <div className="w-[115px] flex flex-col items-center justify-center flex-shrink-0 gap-2">
              <img 
                src="/logo.png" 
                alt="Buyzze" 
                className="w-[65px] h-auto object-contain drop-shadow-sm"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <p className="text-[11px] font-semibold text-gray-600 leading-tight">
                Verifying your <span className="text-[#25D366] font-bold">Number</span>
              </p>
            </div>

            {/* MIDDLE: Vertical Divider Line */}
            <div className="w-[1px] h-[90px] bg-gray-200 mx-2"></div>

            {/* RIGHT SIDE: Action WhatsApp Button */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <button 
                onClick={() => {
                  if (waLink) window.location.href = waLink;
                }} 
                disabled={!waLink || loading}
                className="w-full max-w-[220px] h-[44px] bg-[#25D366] text-white font-medium text-[13px] rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-[#20bd5a] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* As-it-is Original WhatsApp Icon */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Polling Status Label */}
          {pollingStatus && (
            <p className={`text-[11px] font-medium mt-1 animate-pulse ${
              pollingStatus.includes("Successfully") ? "text-green-600" : "text-blue-500"
            }`}>
              {pollingStatus}
            </p>
          )}

          {/* Locked Footer */}
          <div className="mt-4 text-[10px] text-gray-400 flex items-center justify-center gap-1.5 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured by Buyzze
          </div>

        </div>
      </div>
    </>
  );
}