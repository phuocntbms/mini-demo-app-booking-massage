// Kiểm tra quyền admin
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/pages/auth/login.html';
        return;
    }
}

let selectedServiceId = null;

// Hiển thị danh sách dịch vụ
function displayServices() {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const tbody = document.getElementById('servicesTableBody');
    tbody.innerHTML = '';
    
    services.forEach(service => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${service.name}</td>
            <td>${service.description}</td>
            <td>
                <img src="${service.image}" alt="${service.name}" class="w-20 h-20 object-cover rounded">
            </td>
            <td>
                <button onclick="editService('${service.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    Sửa
                </button>
                <button onclick="openDeleteModal('${service.id}')" class="text-red-600 hover:text-red-800">
                    Xóa
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mở modal thêm/sửa dịch vụ
function openServiceModal() {
    document.getElementById('serviceModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Thêm dịch vụ mới';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
}

// Đóng modal
function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// Mở modal xác nhận xóa
function openDeleteModal(id) {
    selectedServiceId = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Đóng modal xác nhận xóa
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedServiceId = null;
}

// Sửa dịch vụ
function editService(id) {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const service = services.find(s => s.id === id);
    
    if (service) {
        document.getElementById('modalTitle').textContent = 'Sửa dịch vụ';
        document.getElementById('serviceId').value = service.id;
        
        const form = document.getElementById('serviceForm');
        form.name.value = service.name;
        form.description.value = service.description;
        form.image.value = service.image;
        
        openServiceModal();
    }
}

// Xác nhận xóa dịch vụ
function confirmDelete() {
    if (selectedServiceId) {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const updatedServices = services.filter(service => service.id !== selectedServiceId);
        localStorage.setItem('services', JSON.stringify(updatedServices));
        
        closeDeleteModal();
        displayServices();
    }
}

// Xử lý form thêm/sửa dịch vụ
document.getElementById('serviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    const formData = {
        name: this.name.value.trim(),
        description: this.description.value.trim(),
        image: this.image.value.trim(),
        id: this.id.value || Date.now().toString()
    };
    
    let hasError = false;
    
    if (!formData.name) {
        document.getElementById('name-error').textContent = 'Vui lòng nhập tên dịch vụ';
        hasError = true;
    }
    
    if (!formData.description) {
        document.getElementById('description-error').textContent = 'Vui lòng nhập mô tả';
        hasError = true;
    }
    
    if (!formData.image) {
        document.getElementById('image-error').textContent = 'Vui lòng nhập URL hình ảnh';
        hasError = true;
    }
    
    if (!hasError) {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        
        if (formData.id && services.some(s => s.id === formData.id)) {
            // Update existing service
            const index = services.findIndex(s => s.id === formData.id);
            services[index] = formData;
        } else {
            // Add new service
            services.push(formData);
        }
        
        localStorage.setItem('services', JSON.stringify(services));
        closeServiceModal();
        displayServices();
    }
});

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/pages/auth/login.html';
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    displayServices();
}); 