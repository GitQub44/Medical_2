// Registration Form with Enhanced Error Handling
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистрируем...';

        const userData = {
            name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };

        // Basic validation
        if (!userData.email.includes('@')) {
            throw new Error('Некорректный email');
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Ошибка сервера');
        }

        alert(`Регистрация успешна! Добро пожаловать, ${result.user.name}`);
        console.log('Registration success:', result);

    } catch (error) {
        console.error('Registration error:', error);
        alert(`Ошибка: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зарегистрироваться';
    }
});

// BMI Calculator (Frontend-only)
document.getElementById('calculate-bmi').addEventListener('click', () => {
    try {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value) / 100;
        
        if (isNaN(weight) throw new Error('Введите корректный вес');
        if (isNaN(height) || height <= 0) throw new Error('Введите корректный рост');

        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi-value').textContent = `ИМТ: ${bmi}`;
        
        // BMI Categories
        let category = '';
        if (bmi < 18.5) category = 'Недостаточный вес';
        else if (bmi < 25) category = 'Нормальный вес';
        else if (bmi < 30) category = 'Избыточный вес';
        else category = 'Ожирение';
        
        document.getElementById('bmi-category').textContent = `Категория: ${category}`;

    } catch (error) {
        alert(error.message);
    }
});

// Blood Pressure Tracker
document.getElementById('save-pressure').addEventListener('click', async () => {
    try {
        const pressureData = {
            systolic: parseInt(document.getElementById('systolic').value),
            diastolic: parseInt(document.getElementById('diastolic').value),
            pulse: parseInt(document.getElementById('pulse').value) || null
        };

        if (isNaN(pressureData.systolic) || isNaN(pressureData.diastolic)) {
            throw new Error('Введите корректные значения давления');
        }

        const response = await fetch('/api/health/pressure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(pressureData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка сохранения');
        }

        alert('Данные давления сохранены!');
        
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Pressure save error:', error);
    }
});

// Chatbot Functionality
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Ошибка чата');

        addMessage(data.reply, 'bot');
    } catch (error) {
        addMessage("⚠️ Ошибка соединения с сервером", 'bot');
        console.error('Chat error:', error);
    }
}

// Helper function for chat messages
function addMessage(text, sender) {
    const chatContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}