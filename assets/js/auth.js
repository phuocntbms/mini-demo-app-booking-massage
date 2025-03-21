// Khởi tạo admin account nếu chưa có
function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some(user => user.role === 'admin');

    if (!adminExists) {
        users.push({
            fullname: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Xử lý đăng ký
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        const fullname = this.fullname.value.trim();
        const email = this.email.value.trim();
        const password = this.password.value;
        const confirmPassword = this.confirmPassword.value;
        
        let hasError = false;
        
        // Validate fullname
        if (!fullname) {
            document.getElementById('fullname-error').textContent = 'Họ và tên không được để trống';
            hasError = true;
        }
        
        // Validate email
        if (!email) {
            document.getElementById('email-error').textContent = 'Email không được để trống';
            hasError = true;
        } else if (!isValidEmail(email)) {
            document.getElementById('email-error').textContent = 'Email không đúng định dạng';
            hasError = true;
        }
        
        // Validate password
        if (!password) {
            document.getElementById('password-error').textContent = 'Mật khẩu không được để trống';
            hasError = true;
        } else if (password.length < 8) {
            document.getElementById('password-error').textContent = 'Mật khẩu phải có ít nhất 8 ký tự';
            hasError = true;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            document.getElementById('confirmPassword-error').textContent = 'Vui lòng xác nhận mật khẩu';
            hasError = true;
        } else if (password !== confirmPassword) {
            document.getElementById('confirmPassword-error').textContent = 'Mật khẩu không khớp';
            hasError = true;
        }
        
        if (!hasError) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                document.getElementById('email-error').textContent = 'Email đã được sử dụng';
                return;
            }
            
            // Add new user
            users.push({
                fullname,
                email,
                password,
                role: 'user'
            });
            
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Đăng ký thành công!');
            window.location.href = 'login.html';
        }
    });
}

// Xử lý đăng nhập
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        const email = this.email.value.trim();
        const password = this.password.value;
        
        let hasError = false;
        
        // Validate email
        if (!email) {
            document.getElementById('email-error').textContent = 'Email không được để trống';
            hasError = true;
        }
        
        // Validate password
        if (!password) {
            document.getElementById('password-error').textContent = 'Mật khẩu không được để trống';
            hasError = true;
        }
        
        if (!hasError) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                if (user.role === 'admin') {
                    window.location.href = '../admin/dashboard.html';
                } else {
                    window.location.href = '../../index.html';
                }
            } else {
                document.getElementById('email-error').textContent = 'Email hoặc mật khẩu không đúng';
            }
        }
    });
}

// Initialize admin account when the script loads
initializeAdmin(); 