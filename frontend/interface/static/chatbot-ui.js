function initializeChatbot() {
    console.log('[chatbot-ui] initializing...');

    // --- CONFIGURAÇÃO DA API ---
    // ⚠️ SUBSTITUA PELO SEU LINK DO RENDER ⚠️
    const API_BASE_URL = "https://beckend-byte.onrender.com; 
    // ---------------------------

    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotContainer = document.getElementById('chatbot-container');
    // ... (resto das declarações de variáveis continuam iguais)

    // ... (código do toggle e updateCurrentTime continua igual) ...

    // --- CORREÇÃO 1: Função sendToServer ---
    async function sendToServer(message) {
        try {
            // Mudamos de '/chat' para a URL completa
            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error('Erro na resposta do servidor');
            const data = await res.json();
            return data.response || 'Desculpe, não obtive resposta.';
        } catch (err) {
            console.warn('Chatbot: erro ao chamar API, verifique a URL.', err);
            return null; 
        }
    }

    // ... (funções sendMessage, addMessage continuam iguais) ...

    // --- CORREÇÃO 2: Formulário de Leads ---
    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const name = document.getElementById('lead-name').value;
            const email = document.getElementById('lead-email').value;
            const submitBtn = document.getElementById('lead-submit-btn');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                // Mudamos de '/leads' para a URL completa
                const response = await fetch(`${API_BASE_URL}/leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email }),
                });

                if (!response.ok) {
                    throw new Error('Falha ao enviar os dados.');
                }

                console.log('[chatbot-ui] Lead enviado com sucesso');
                leadFormContainer.classList.add('hidden');
                chatConversation.classList.remove('hidden');
                addWelcomeMessage(name);

            } catch (error) {
                console.error('Erro:', error);
                alert("Erro ao conectar com o servidor. Tente novamente.");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Conversa';
            }
        });
    }
    // ... (resto do código)
}
initializeChatbot();
