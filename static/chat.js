document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const initialView = document.getElementById("initial-view");
    const predefinedQuestions = document.querySelectorAll(".predefined-questions a");

    let userMessage;
    
    // CORREÇÃO: URL Absoluta do Render
    const API_URL = "[https://beckend-byte.onrender.com/chat](https://beckend-byte.onrender.com/chat)"; 

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<p>${message}</p>`;
        chatLi.innerHTML = chatContent;
        return chatLi;
    }

    const showTypingIndicator = () => {
        if (initialView && !initialView.hidden) {
            initialView.hidden = true;
        }
        const typingLi = document.createElement("li");
        typingLi.classList.add("chat", "incoming", "typing-indicator-li");
        typingLi.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatbox.appendChild(typingLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    const hideTypingIndicator = () => {
        const typingIndicator = document.querySelector(".typing-indicator-li");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    const generateResponse = (incomingChatLi) => {
        const messageElement = incomingChatLi.querySelector("p");

        fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessage })
        })
        .then(res => res.json())
        .then(data => {
            hideTypingIndicator(); 
            const botResponseLi = createChatLi(data.response, "incoming");
            chatbox.appendChild(botResponseLi);
        })
        .catch((error) => {
            hideTypingIndicator(); 
            const errorLi = createChatLi("Oops! Algo deu errado.", "incoming");
            chatbox.appendChild(errorLi);
            console.error("Erro:", error);
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    const handleChat = (message) => {
        userMessage = message.trim();
        if (!userMessage) return;

        chatInput.value = ""; 
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            showTypingIndicator();
            generateResponse(chatbox.lastChild);
        }, 600);
    }

    predefinedQuestions.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const question = e.target.getAttribute("data-question");
            handleChat(question);
        });
    });

    sendChatBtn.addEventListener("click", () => handleChat(chatInput.value));

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat(chatInput.value);
        }
    });
});
