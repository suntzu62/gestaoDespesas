import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/telemetry';

export const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const whatsappNumber = "5511999999999"; // Substitua pelo número real
  const whatsappMessage = encodeURIComponent("Olá! Quero organizar minhas finanças com o BolsoZen 💰");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after user scrolls down 50% of viewport height
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      if (scrollY > viewportHeight * 0.5 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollY < viewportHeight * 0.3) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleCTAClick = () => {
    trackEvent('cta_click', { 
      source: 'sticky_cta',
      button_text: 'Começar pelo WhatsApp'
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    trackEvent('sticky_cta_dismissed', {});
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-green-600 text-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="font-semibold text-lg">Controle via WhatsApp</div>
            <div className="text-green-100 text-sm">Envie comprovante e confirme</div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCTAClick}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Começar pelo WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
            
            <button
              onClick={handleDismiss}
              className="text-green-100 hover:text-white p-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};