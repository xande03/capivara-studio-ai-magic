import React, { useEffect, useState } from 'react';

export const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // A tela de splashscreen ficará visível por 3 segundos

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-4xl font-bold text-center">
        Olá, Alexandre
      </div>
    </div>
  );
};