// ==================== INITIALIZATION ====================
let currentUser = null;
let stream = null;
let flashOn = false;

/// ==================== REGISTRATION ====================
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('reg-status');
    
    try {
        // UI State
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Get form data
        const userData = {
            name: form.querySelector('#reg-name').value.trim(),
            email: form.querySelector('#reg-email').value.trim(),
            password: form.querySelector('#reg-password').value,
            role: form.querySelector('#reg-role').value
        };

        // Validate
        if (!userData.name) {
            showError('name-error', 'Please enter your name');
            throw new Error('Name required');
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            showError('email-error', 'Please enter a valid email');
            throw new Error('Invalid email');
        }
        
        if (userData.password.length < 6) {
            showError('password-error', 'Password must be 6+ characters');
            throw new Error('Password too short');
        }

        // API Call
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            const errorMsg = result.message || 'Registration failed';
            throw new Error(errorMsg);
        }

        // Success
        currentUser = result.user;
        localStorage.setItem('authToken', result.token || 'dummy-token'); // In real app, backend should return token
        
        statusDiv.textContent = `Welcome ${userData.name}! Registration successful.`;
        statusDiv.className = 'status-message success';
        form.reset();

        // Redirect or update UI
        setTimeout(() => {
            window.location.href = '/dashboard.html'; // Or show logged-in state
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        statusDiv.textContent = error.message;
        statusDiv.className = 'status-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

// ==================== BMI CALCULATOR ====================
document.getElementById('calculate-bmi').addEventListener('click', () => {
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

    // Calculate position (0-100%)
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

    // Update UI
    bmiIndicator.style.left = `${position}%`;
    bmiValue.innerHTML = `ИМТ: <strong>${bmi}</strong>`;
    bmiCategory.innerHTML = `Категория: <span class="${color}-text">${category}</span>`;
    bmiAdvice.textContent = advice;
    consultBtn.style.display = (bmi < 18.5 || bmi >= 25) ? 'block' : 'none';
}

// ==================== CAMERA FUNCTIONALITY ====================
document.getElementById('start-camera').addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        document.getElementById('camera-view').srcObject = stream;
        document.getElementById('take-photo').disabled = false;
        this.textContent = 'Камера включена';
        this.disabled = true;
    } catch (err) {
        alert("Ошибка доступа к камере: " + err.message);
    }
});

document.getElementById('toggle-flash').addEventListener('click', function() {
    flashOn = !flashOn;
    this.querySelector('i').className = flashOn ? 'fas fa-bolt' : 'far fa-bolt';
});

document.getElementById('take-photo').addEventListener('click', function() {
    const cameraView = document.getElementById('camera-view');
    const photoResult = document.getElementById('photo-result');
    const ctx = photoResult.getContext('2d');
    
    // Set canvas size
    photoResult.width = cameraView.videoWidth;
    photoResult.height = cameraView.videoHeight;
    
    // Flash effect
    if (flashOn) {
        document.body.style.backgroundColor = 'white';
        setTimeout(() => document.body.style.backgroundColor = '', 100);
    }
    
    // Capture image
    ctx.drawImage(cameraView, 0, 0, photoResult.width, photoResult.height);
    
    // Show result
    photoResult.style.display = 'block';
    cameraView.style.display = 'none';
    this.disabled = true;
});

// ==================== DOCTOR APPOINTMENT ====================
document.getElementById('health-category').addEventListener('change', async function() {
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

document.getElementById('appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('appointment-status');
    
    try {
        submitBtn.disabled = true;
        statusDiv.style.display = 'none';

        if (!currentUser) {
            throw new Error('Пожалуйста, сначала зарегистрируйтесь');
        }

        const appointmentData = {
            patientId: currentUser.id,
            doctorId: form.querySelector('#select-doctor').value,
            category: form.querySelector('#health-category').value,
            symptoms: form.querySelector('#symptoms').value,
            urgency: form.querySelector('#urgency-level').value
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
        
        // Start listening for updates
        listenForAppointmentUpdates(result.appointmentId);
        
    } catch (error) {
        statusDiv.textContent = `Ошибка: ${error.message}`;
        statusDiv.style.backgroundColor = 'var(--emergency-red)';
        statusDiv.style.display = 'block';
        console.error('Appointment error:', error);
    } finally {
        submitBtn.disabled = false;
    }
});

function listenForAppointmentUpdates(appointmentId) {
    // In production: Use WebSocket for real-time updates
    console.log(`Would connect to WebSocket for appointment ${appointmentId}`);
}

// ==================== CHATBOT ====================
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    
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