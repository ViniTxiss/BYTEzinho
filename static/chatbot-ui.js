function initializeChatbot() {
    console.log('[chatbot-ui] initializing...');
    
    // --- CONFIGURAÇÃO: CONECTANDO AO BACKEND NO RENDER ---
    const BACKEND_URL = "https://beckend-byte.onrender.com"; 
    // -----------------------------------------------------

    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatBody = document.getElementById('chatbot-body');
    const inputField = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send-btn');

    // Elementos do formulário de lead
    const leadFormContainer = document.getElementById('lead-capture-form');
    const leadForm = document.getElementById('chatbot-lead-form');
    const chatConversation = document.getElementById('chat-conversation');
    const timeElement = document.getElementById('current-time');

    function updateCurrentTime() {
        if (!timeElement) return;
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    updateCurrentTime();
    setInterval(updateCurrentTime, 60 * 1000);

    if (chatbotToggler && chatbotContainer) {
        console.log('[chatbot-ui] found elements, attaching direct listeners');
        chatbotToggler.addEventListener('click', () => {
            chatbotContainer.classList.add('active');
            chatbotToggler.classList.add('chat-active');
            chatbotContainer.setAttribute('aria-hidden', 'false');
            const leadNameField = document.getElementById('lead-name');
            leadNameField && leadNameField.focus();
        });

        closeBtn && closeBtn.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
            chatbotToggler.classList.remove('chat-active');
            chatbotToggler.focus(); 
            chatbotContainer.setAttribute('aria-hidden', 'true');
        });
    } else {
        document.addEventListener('click', (e) => {
            try {
                const toggler = e.target.closest && e.target.closest('#chatbot-toggler');
                const close = e.target.closest && e.target.closest('#chatbot-close-btn');
                if (toggler) {
                    const container = document.getElementById('chatbot-container');
                    if (container) {
                        toggler.classList.add('chat-active');
                        container.classList.add('active');
                        container.setAttribute('aria-hidden', 'false');
                        const leadNameField = document.getElementById('lead-name');
                        leadNameField && leadNameField.focus();
                    }
                }
                if (close) {
                    const container = document.getElementById('chatbot-container');
                    if (container) {
                        const toggler = document.getElementById('chatbot-toggler');
                        toggler && toggler.classList.remove('chat-active');
                        toggler && toggler.focus();
                        container.classList.remove('active');
                        container.setAttribute('aria-hidden', 'true');
                    }
                }
            } catch (err) {
                console.error('[chatbot-ui] delegation handler error', err);
            }
        });
    }

    function addWelcomeMessage(userName) {
        const welcomeContainer = document.getElementById('welcome-message-content');
        if (!welcomeContainer) return;

        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        welcomeContainer.innerHTML = `
            <strong>Bytezinho AI</strong>
            <p>Olá, ${escapeHtml(userName)}! Sou o Bytezinho, seu assistente de IA. Como posso ajudar você hoje?</p>
            <div class="suggestions">
                <button class="suggestion-btn" data-message="Como faço para participar?">Como faço para participar?</button>
                <button class="suggestion-btn" data-message="Sou menor de idade posso participar?">Sou menor de idade posso participar?</button>
                <button class="suggestion-btn" data-message="Onde eu posso fazer o curso?">Onde eu posso fazer o curso?</button>
            </div>
            <span class="message-time">${time}</span>
        `;

        const newSuggestionBtns = welcomeContainer.querySelectorAll('.suggestion-btn');
        newSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => handleSuggestionClick(btn));
        });
    }

    function addMessage(message, isBot = false, stream = false) {
        if (!chatBody) return;

        if (!isBot || !stream) {
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message ${isBot ? 'bot' : 'user'}`;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            wrapper.innerHTML = `
                <div class="message-content">
                    ${isBot ? '<strong>Bytezinho AI</strong>' : ''}
                    <p>${escapeHtml(message)}</p>
                    <span class="message-time">${time}</span>
                </div>
            `;
        chatBody.appendChild(wrapper);
        chatBody.scrollTop = chatBody.scrollHeight;
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'chat-message bot';
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        wrapper.innerHTML = `
            <div class="message-content">
                <strong>Bytezinho AI</strong>
                <p></p>
                <span class="message-time">${time}</span>
            </div>`;
        chatBody.appendChild(wrapper);
        chatBody.scrollTop = chatBody.scrollHeight;

        const p = wrapper.querySelector('p');
        let i = 0;
        const speed = 30; 

        const typingInterval = setInterval(() => {
            if (i < message.length) {
                p.innerHTML += escapeHtml(message.charAt(i));
                i++;
                chatBody.scrollTop = chatBody.scrollHeight;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&#039;");
    }

    async function sendToServer(message) {
        try {
            // CORREÇÃO: Usa a URL absoluta do Render
            const res = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error('Erro na resposta do servidor');
            const data = await res.json();
            return data.response || 'Desculpe, não obtive resposta.';
        } catch (err) {
            console.warn('Chatbot: erro ao chamar API', err);
            return null; 
        }
    }

    async function sendMessage() {
        const message = inputField.value.trim();
        if (!message) return;
        addMessage(message, false);
        inputField.value = '';
        inputField.style.height = ''; 

        const typing = document.createElement("div");
        typing.className = "chat-message bot typing-indicator-li"; 
        typing.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>`;
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;

        const serverResp = await sendToServer(message);
        typing.remove();

        if (serverResp) {
            addMessage(serverResp, true, true); 
        } else {
            addMessage('Desculpe, ainda estou aprendendo a responder essa pergunta. (modo offline)', true, true);
        }
    }

    sendBtn && sendBtn.addEventListener('click', sendMessage);
    inputField && inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    async function handleSuggestionClick(btn) {
        const message = btn.getAttribute('data-message');
        if (!message) return;
        if (inputField) {
            inputField.value = message;
            inputField.focus();
        }
        await sendMessage();
        const suggestionsContainer = btn.closest('.suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const name = document.getElementById('lead-name').value;
            const email = document.getElementById('lead-email').value;
            const submitBtn = document.getElementById('lead-submit-btn');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                // CORREÇÃO: Usa a URL absoluta do Render para salvar leads
                const response = await fetch(`${BACKEND_URL}/leads`, {
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
}

initializeChatbot();
