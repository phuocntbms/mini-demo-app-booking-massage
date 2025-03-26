// Kiểm tra quyền admin
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/pages/auth/login.html';
        return;
    }
}

// Các biến quản lý phân trang và lọc
let currentPage = 1;
const itemsPerPage = 5;
let selectedScheduleId = null;
let filteredSchedules = [];

// Khởi tạo biểu đồ
let scheduleChart = null;

// Cập nhật thống kê
function updateStats(schedules) {
    const gymCount = schedules.filter(s => s.class === 'Gym').length;
    const yogaCount = schedules.filter(s => s.class === 'Yoga').length;
    const zumbaCount = schedules.filter(s => s.class === 'Zumba').length;

    document.getElementById('gymCount').textContent = gymCount;
    document.getElementById('yogaCount').textContent = yogaCount;
    document.getElementById('zumbaCount').textContent = zumbaCount;

    // Cập nhật biểu đồ
    if (scheduleChart) {
        scheduleChart.destroy();
    }

    const ctx = document.getElementById('scheduleChart').getContext('2d');
    scheduleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Gym', 'Yoga', 'Zumba'],
            datasets: [{
                label: 'Số lượng lịch đặt',
                data: [gymCount, yogaCount, zumbaCount],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(139, 92, 246, 0.5)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Lọc danh sách lịch
function filterSchedules() {
    const classFilter = document.getElementById('classFilter').value;
    const emailFilter = document.getElementById('emailFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    filteredSchedules = schedules.filter(schedule => {
        const matchClass = !classFilter || schedule.class === classFilter;
        const matchEmail = !emailFilter || schedule.email.toLowerCase().includes(emailFilter);
        const matchDate = !dateFilter || schedule.date === dateFilter;
        
        return matchClass && matchEmail && matchDate;
    });

    currentPage = 1;
    displaySchedules();
    updateStats(schedules);
}

// Hiển thị danh sách lịch
function displaySchedules() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);
    
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
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
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

// Mở modal chỉnh sửa
function openBookingModal() {
    document.getElementById('bookingModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Chỉnh sửa lịch';
    document.getElementById('bookingForm').reset();
}

// Đóng modal chỉnh sửa
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
        filterSchedules();
    }
}

// Sửa lịch
function editSchedule(id) {
    const schedules = JSON.parse(localStorage.getItem('schedules'));
    const schedule = schedules.find(s => s.id === id);
    
    if (schedule) {
        document.getElementById('modalTitle').textContent = 'Sửa lịch';
        document.getElementById('bookingId').value = schedule.id;
        document.getElementById('bookingEmail').value = schedule.email;
        document.getElementById('bookingFullname').value = schedule.fullname;
        
        const form = document.getElementById('bookingForm');
        form.class.value = schedule.class;
        form.date.value = schedule.date;
        form.time.value = schedule.time;
        
        openBookingModal();
    }
}

// Xử lý form chỉnh sửa
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    const formData = {
        id: this.id.value,
        class: this.class.value,
        date: this.date.value,
        time: this.time.value,
        email: this.email.value,
        fullname: this.fullname.value
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
            document.getElementById('time-error').textContent = 'Người dùng đã đặt lịch vào khung giờ này';
            return;
        }
        
        const index = schedules.findIndex(s => s.id === formData.id);
        if (index !== -1) {
            schedules[index] = formData;
            localStorage.setItem('schedules', JSON.stringify(schedules));
            closeBookingModal();
            filterSchedules();
        }
    }
});

// Xử lý sự kiện thay đổi bộ lọc
document.getElementById('classFilter').addEventListener('change', filterSchedules);
document.getElementById('emailFilter').addEventListener('input', filterSchedules);
document.getElementById('dateFilter').addEventListener('change', filterSchedules);

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/pages/auth/login.html';
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    //checkAdminAuth();
    filterSchedules();
}); 