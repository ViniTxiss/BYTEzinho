// --- LÓGICA DOS OVERLAYS ---

  // 1. Lógica do Overlay de Detalhes (Footer)
  // MOVIDO PARA DENTRO DO BLOCO CORRETO
  const detailsToggler = document.getElementById('details-toggler');
  const detailsOverlay = document.getElementById('chatbot-details-overlay');
  const closeDetailsBtn = document.getElementById('close-details-btn'); // Assumindo que você tem este botão

  if (detailsToggler && detailsOverlay) {
      detailsToggler.addEventListener('click', (e) => {
          e.preventDefault();
          detailsOverlay.classList.add('active');
      });
      
      // Fecha ao clicar no botão de fechar (se existir)
      if (closeDetailsBtn) {
          closeDetailsBtn.addEventListener('click', () => {
              detailsOverlay.classList.remove('active');
          });
      }
      
      // Fecha ao clicar fora do card (opcional)
      detailsOverlay.addEventListener('click', (e) => {
          if (e.target === detailsOverlay) {
              detailsOverlay.classList.remove('active');
          }
      });
  }

  // 2. Lógica do Overlay de Integração (Scroll)
  const integrationOverlay = document.getElementById('integration-overlay');
  const closeIntegrationBtn = document.getElementById('close-integration-btn');
  let integrationOverlayTriggered = false;

  function handleScroll() {
      if (!integrationOverlayTriggered && window.scrollY > 50) {
          if (integrationOverlay) {
              integrationOverlay.classList.add('active');
              integrationOverlayTriggered = true;
              window.removeEventListener('scroll', handleScroll);
          }
      }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (integrationOverlay && closeIntegrationBtn) {
      const closeIntegrationOverlay = () => {
          integrationOverlay.classList.remove('active');
      };

      closeIntegrationBtn.addEventListener('click', closeIntegrationOverlay);
      
      integrationOverlay.addEventListener('click', (e) => {
          if (e.target.id === 'integration-overlay') closeIntegrationOverlay();
      });
      
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && integrationOverlay.classList.contains('active')) {
              closeIntegrationOverlay();
          }
      });
  }

}); // <--- ESTA É A CHAVETA FINAL QUE FECHA O DOMContentLoaded. NADA DEVE FICAR DEPOIS DELA.
