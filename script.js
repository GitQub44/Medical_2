// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let stream = null;
let flashOn = false;

// ==================== DOM LOAD EVENT ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeRegistration();
    initializeCamera();
    initializeBMICalculator();
    initializeAppointment();
    initializeChatbot();
});

// ==================== REGISTRATION SYSTEM ====================
function initializeRegistration() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        registerForm.appendChild(statusDiv);

        try {
            // UI Feedback
            submitBtn.disabled = true;
            submitBtn.textContent = 'Регистрация...';
            statusDiv.textContent = '';
            
            // Get form data
            const userData = {
                name: document.getElementById('reg-name').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value,
                role: document.getElementById('reg-role').value
            };

            // Validation
            if (!userData.name) throw new Error('Введите ваше имя');
            if (!userData.email.includes('@')) throw new Error('Неверный формат email');
            if (userData.password.length < 6) throw new Error('Пароль должен быть не менее 6 символов');

            // API Request
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Ошибка регистрации');
            }

            // Success
            currentUser = result.user;
            statusDiv.textContent = `Регистрация успешна! Добро пожаловать, ${userData.name}`;
            statusDiv.className = 'status-message success';
            registerForm.reset();

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            statusDiv.textContent = error.message;
            statusDiv.className = 'status-message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
        }
    });
}

// ==================== CAMERA SYSTEM ====================
function initializeCamera() {
    const startCameraBtn = document.getElementById('start-camera');
    const toggleFlashBtn = document.getElementById('toggle-flash');
    const takePhotoBtn = document.getElementById('take-photo');
    const cameraView = document.getElementById('camera-view');
    const photoResult = document.getElementById('photo-result');

    if (!startCameraBtn) return;

    startCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            cameraView.srcObject = stream;
            takePhotoBtn.disabled = false;
            startCameraBtn.textContent = 'Камера включена';
            startCameraBtn.disabled = true;
        } catch (err) {
            alert("Ошибка доступа к камере: " + err.message);
        }
    });

    toggleFlashBtn.addEventListener('click', function() {
        flashOn = !flashOn;
        this.querySelector('i').className = flashOn ? 'fas fa-bolt' : 'far fa-bolt';
    });

    takePhotoBtn.addEventListener('click', function() {
        const ctx = photoResult.getContext('2d');
        photoResult.width = cameraView.videoWidth;
        photoResult.height = cameraView.videoHeight;
        
        // Flash effect
        if (flashOn) {
            document.body.style.backgroundColor = 'white';
            setTimeout(() => document.body.style.backgroundColor = '', 100);
        }
        
        ctx.drawImage(cameraView, 0, 0, photoResult.width, photoResult.height);
        photoResult.style.display = 'block';
        cameraView.style.display = 'none';
        this.disabled = true;
    });
}

// ==================== BMI CALCULATOR ====================
function initializeBMICalculator() {
    const calculateBtn = document.getElementById('calculate-bmi');
    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', () => {
        try {
            const weight = parseFloat(document.getElementById('bmi-weight').value);
            const height = parseFloat(document.getElementById('bmi-height').value) / 100;
            
            if (isNaN(weight)) throw new Error('Введите корректный вес');
            if (isNaN(height) || height <= 0) throw new Error('Введите корректный рост');

            const bmi = (weight / (height * height)).toFixed(1);
            updateBmiDisplay(bmi);
            
        } catch (error) {
            alert(error.message);
        }
    });

    function updateBmiDisplay(bmi) {
        const bmiValue = document.getElementById('bmi-value');
        const bmiCategory = document.getElementById('bmi-category');
        const bmiAdvice = document.getElementById('bmi-advice');
        const bmiIndicator = document.querySelector('.bmi-indicator');
        const consultBtn = document.getElementById('bmi-consult-btn');

        let position, category, color, advice;
        
        if (bmi < 16) {
            position = 0;
            category = 'Выраженный дефицит';
            color = 'red';
            advice = 'Рекомендуется срочная консультация врача';
        } else if (bmi < 18.5) {
            position = 25;
            category = 'Недостаточный вес';
            color = 'orange';
            advice = 'Рекомендуется консультация диетолога';
        } else if (bmi < 25) {
            position = 50;
            category = 'Нормальный вес';
            color = 'green';
            advice = 'Ваш вес в норме';
        } else if (bmi < 30) {
            position = 75;
            category = 'Избыточный вес';
            color = 'orange';
            advice = 'Рекомендуется увеличить физическую активность';
        } else {
            position = 100;
            category = 'Ожирение';
            color = 'red';
            advice = 'Рекомендуется консультация врача';
        }

        bmiIndicator.style.left = `${position}%`;
        bmiValue.innerHTML = `ИМТ: <strong>${bmi}</strong>`;
        bmiCategory.innerHTML = `Категория: <span class="${color}-text">${category}</span>`;
        bmiAdvice.textContent = advice;
        consultBtn.style.display = (bmi < 18.5 || bmi >= 25) ? 'block' : 'none';
    }
}

// ==================== DOCTOR APPOINTMENT ====================
function initializeAppointment() {
    const healthCategory = document.getElementById('health-category');
    const appointmentForm = document.getElementById('appointment-form');
    
    if (!healthCategory || !appointmentForm) return;

    healthCategory.addEventListener('change', async function() {
        if (!this.value) return;
        
        try {
            const response = await fetch(`/api/doctors?specialty=${this.value}`);
            if (!response.ok) throw new Error('Ошибка загрузки врачей');
            
            const doctors = await response.json();
            const select = document.getElementById('select-doctor');
            
            select.innerHTML = '<option value="">Выберите врача</option>';
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.name} (${doctor.specialty})`;
                select.appendChild(option);
            });
            
            select.disabled = false;
        } catch (error) {
            alert(error.message);
        }
    });

    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = appointmentForm.querySelector('button[type="submit"]');
        const statusDiv = document.getElementById('appointment-status');
        
        try {
            submitBtn.disabled = true;
            statusDiv.style.display = 'none';

            if (!currentUser) {
                throw new Error('Пожалуйста, сначала зарегистрируйтесь');
            }

            const appointmentData = {
                patientId: currentUser.id,
                doctorId: document.getElementById('select-doctor').value,
                category: document.getElementById('health-category').value,
                symptoms: document.getElementById('symptoms').value,
                urgency: document.getElementById('urgency-level').value
            };

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || result.error);

            statusDiv.textContent = `Запись успешна! Номер в очереди: ${result.queuePosition}`;
            statusDiv.style.backgroundColor = 'var(--success-green)';
            statusDiv.style.display = 'block';
            
        } catch (error) {
            statusDiv.textContent = `Ошибка: ${error.message}`;
            statusDiv.style.backgroundColor = 'var(--emergency-red)';
            statusDiv.style.display = 'block';
            console.error('Appointment error:', error);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// ==================== CHATBOT SYSTEM ====================
function initializeChatbot() {
    const sendBtn = document.getElementById('send-message');
    const userInput = document.getElementById('user-input');
    
    if (!sendBtn || !userInput) return;

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
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
            addMessage("Извините, произошла ошибка соединения", 'bot');
            console.error('Chat error:', error);
        }
    }

    function addMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.textContent = text;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
}