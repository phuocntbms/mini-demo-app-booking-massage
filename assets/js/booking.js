// Kiểm tra đăng nhập
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/pages/auth/login.html';
        return;
    }
    
    // Hiển thị thông tin user
    document.getElementById('userInfo').innerHTML = `
        <span class="mr-2">${currentUser.fullname}</span>
        <button onclick="logout()" class="bg-red-500 px-3 py-1 rounded">Đăng xuất</button>
    `;
}

// Khởi tạo dữ liệu mẫu
function initializeSchedules() {
    if (!localStorage.getItem('schedules')) {
        localStorage.setItem('schedules', JSON.stringify([]));
    }
}

// Các biến quản lý phân trang
let currentPage = 1;
const itemsPerPage = 5;
let selectedScheduleId = null;

// Hiển thị danh sách lịch
function displaySchedules() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const schedules = JSON.parse(localStorage.getItem('schedules'))
        .filter(schedule => schedule.email === currentUser.email);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchedules = schedules.slice(startIndex, endIndex);
    
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';
    
    paginatedSchedules.forEach(schedule => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${schedule.class}</td>
            <td>${schedule.date}</td>
            <td>${schedule.time}</td>
            <td>${schedule.fullname}</td>
            <td>${schedule.email}</td>
            <td>
                <button onclick="editSchedule('${schedule.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    Sửa
                </button>
                <button onclick="openDeleteModal('${schedule.id}')" class="text-red-600 hover:text-red-800">
                    Xóa
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update pagination
    const totalPages = Math.ceil(schedules.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            displaySchedules();
        };
        pagination.appendChild(button);
    }
}

// Mở modal đặt lịch
function openBookingModal() {
    document.getElementById('bookingModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Đặt lịch mới';
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingId').value = '';
}

// Đóng modal đặt lịch
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// Mở modal xác nhận xóa
function openDeleteModal(id) {
    selectedScheduleId = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Đóng modal xác nhận xóa
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedScheduleId = null;
}

// Xác nhận xóa lịch
function confirmDelete() {
    if (selectedScheduleId) {
        const schedules = JSON.parse(localStorage.getItem('schedules'));
        const updatedSchedules = schedules.filter(schedule => schedule.id !== selectedScheduleId);
        localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        
        closeDeleteModal();
        displaySchedules();
    }
}

// Sửa lịch
function editSchedule(id) {
    const schedules = JSON.parse(localStorage.getItem('schedules'));
    const schedule = schedules.find(s => s.id === id);
    
    if (schedule) {
        document.getElementById('modalTitle').textContent = 'Sửa lịch';
        document.getElementById('bookingId').value = schedule.id;
        
        const form = document.getElementById('bookingForm');
        form.class.value = schedule.class;
        form.date.value = schedule.date;
        form.time.value = schedule.time;
        
        openBookingModal();
    }
}

// Xử lý form đặt lịch
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const formData = {
        class: this.class.value,
        date: this.date.value,
        time: this.time.value,
        fullname: currentUser.fullname,
        email: currentUser.email,
        id: this.id.value || Date.now().toString()
    };
    
    let hasError = false;
    
    // Validate class
    if (!formData.class) {
        document.getElementById('class-error').textContent = 'Vui lòng chọn lớp học';
        hasError = true;
    }
    
    // Validate date
    if (!formData.date) {
        document.getElementById('date-error').textContent = 'Vui lòng chọn ngày tập';
        hasError = true;
    }
    
    // Validate time
    if (!formData.time) {
        document.getElementById('time-error').textContent = 'Vui lòng chọn khung giờ';
        hasError = true;
    }
    
    if (!hasError) {
        const schedules = JSON.parse(localStorage.getItem('schedules'));
        
        // Check for duplicate bookings
        const isDuplicate = schedules.some(schedule => 
            schedule.id !== formData.id && 
            schedule.date === formData.date && 
            schedule.time === formData.time &&
            schedule.email === formData.email
        );
        
        if (isDuplicate) {
            document.getElementById('time-error').textContent = 'Bạn đã đặt lịch vào khung giờ này';
            return;
        }
        
        if (formData.id && schedules.some(s => s.id === formData.id)) {
            // Update existing schedule
            const index = schedules.findIndex(s => s.id === formData.id);
            schedules[index] = formData;
        } else {
            // Add new schedule
            schedules.push(formData);
        }
        
        localStorage.setItem('schedules', JSON.stringify(schedules));
        closeBookingModal();
        displaySchedules();
    }
});

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/pages/auth/login.html';
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeSchedules();
    displaySchedules();
}); 