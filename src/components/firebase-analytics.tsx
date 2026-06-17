'use client';

import { useEffect } from 'react';

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Importa dinamicamente a configuração do Firebase
    // Isso garante que a inicialização aconteça exclusivamente no navegador
    import('@/lib/firebase').then(({ analytics }) => {
      if (analytics) {
        console.log("Firebase Analytics carregado com sucesso!");
      }
    });
  }, []);

  return null;
}
