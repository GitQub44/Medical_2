// Registration Form with Enhanced Error Handling
// Registration Form with Proper Error Handling
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    try {
        const userData = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка регистрации');
        }

        alert(result.message);
        console.log('Registration success:', result);
        
    } catch (error) {
        alert(error.message);
        console.error('Registration error:', error);
    } finally {
        submitBtn.disabled = false;
    }
});

// Working BMI Calculator
document.getElementById('calculate-bmi').addEventListener('click', () => {
    try {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value) / 100;
        
        if (isNaN(weight)) throw new Error('Введите корректный вес');
        if (isNaN(height)) throw new Error('Введите корректный рост');

        const bmi = (weight / (height * height)).toFixed(1);
        updateBmiDisplay(bmi);
        
    } catch (error) {
        alert(error.message);
    }
});

function updateBmiDisplay(bmi) {
    const resultEl = document.getElementById('bmi-result');
    resultEl.innerHTML = `
        <div class="bmi-scale">
            <div class="bmi-indicator" style="left: ${calculateBmiPosition(bmi)}%"></div>
        </div>
        <p>Ваш ИМТ: <strong>${bmi}</strong></p>
        <p>${getBmiCategory(bmi)}</p>
    `;
}

function calculateBmiPosition(bmi) {
    if (bmi < 16) return 0;
    if (bmi < 18.5) return 25;
    if (bmi < 25) return 50;
    if (bmi < 30) return 75;
    return 100;
}

function getBmiCategory(bmi) {
    if (bmi < 16) return 'Выраженный дефицит массы тела';
    if (bmi < 18.5) return 'Недостаточная масса тела';
    if (bmi < 25) return 'Норма';
    if (bmi < 30) return 'Избыточная масса тела';
    return 'Ожирение';
}
// Enhanced Camera with Flash and Capture Modes
let flashOn = false;
let captureMode = 'photo'; // 'photo' or 'analysis'

document.getElementById('toggle-flash').addEventListener('click', () => {
    flashOn = !flashOn;
    document.getElementById('flash-icon').className = flashOn ? 'fas fa-bolt' : 'far fa-bolt';
});

document.getElementById('switch-mode').addEventListener('click', () => {
    captureMode = captureMode === 'photo' ? 'analysis' : 'photo';
    document.getElementById('mode-indicator').textContent = 
        `Режим: ${captureMode === 'photo' ? 'Фото' : 'Анализ кожи'}`;
});

// Modified takePhoto function
takePhoto.addEventListener('click', async () => {
    const canvas = document.getElementById('photo-result');
    const context = canvas.getContext('2d');
    
    // Flash effect
    if (flashOn) {
        document.body.style.backgroundColor = 'white';
        setTimeout(() => document.body.style.backgroundColor = '', 100);
    }
    
    // Capture image
    canvas.width = cameraView.videoWidth;
    canvas.height = cameraView.videoHeight;
    context.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
    
    // Process based on mode
    if (captureMode === 'analysis') {
        await analyzeSkin(canvas);
    }
    
    // Show result
    canvas.style.display = 'block';
    cameraView.style.display = 'none';
});

async function analyzeSkin(canvas) {
    // This would call your backend analysis API
    try {
        const response = await fetch('/api/analyze-skin', {
            method: 'POST',
            body: canvas.toBlob()
        });
        const result = await response.json();
        showAnalysisResults(result);
    } catch (error) {
        console.error('Analysis error:', error);
    }
}

// Doctor Appointment Booking
document.getElementById('book-appointment').addEventListener('click', async () => {
    const formData = {
        patientId: currentUser.id, // From logged in user
        doctorId: document.getElementById('select-doctor').value,
        category: document.getElementById('health-category').value,
        symptoms: document.getElementById('symptoms').value,
        urgency: document.getElementById('urgency-level').value
    };

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        showQueuePosition(data.queuePosition);
        initWebSocket(data.appointmentId); // For real-time updates
        
    } catch (error) {
        alert(`Ошибка записи: ${error.message}`);
    }
});

// WebSocket for real-time updates
function initWebSocket(appointmentId) {
    const socket = new WebSocket(`wss://your-app.vercel.app/api/queue?appointmentId=${appointmentId}`);
    
    socket.onmessage = (event) => {
        const update = JSON.parse(event.data);
        if (update.status === 'doctor-ready') {
            showNotification(`Доктор готов принять вас!`);
        }
        updateQueueDisplay(update.queuePosition);
    };
}

    

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