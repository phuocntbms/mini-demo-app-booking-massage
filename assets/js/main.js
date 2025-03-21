// Kiểm tra trạng thái đăng nhập và hiển thị menu phù hợp
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.getElementById('authLink');
    const adminLink = document.getElementById('adminLink');
    const navLinks = document.getElementById('navLinks');

    if (currentUser) {
        // Đã đăng nhập
        // Thêm lời chào
        const welcomeText = document.createElement('span');
        welcomeText.textContent = `Xin chào, ${currentUser.fullname}`;
        welcomeText.className = 'mr-4 text-yellow-400';
        navLinks.insertBefore(welcomeText, authLink);

        authLink.textContent = 'Đăng xuất';
        authLink.onclick = function(e) {
            e.preventDefault();
            logout();
        };

        // Kiểm tra nếu là admin thì hiển thị link quản lý
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        // Chưa đăng nhập
        // Xóa lời chào nếu có
        const existingWelcome = navLinks.querySelector('span');
        if (existingWelcome) {
            navLinks.removeChild(existingWelcome);
        }

        authLink.textContent = 'Đăng nhập';
        authLink.onclick = null;
        adminLink.style.display = 'none';
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Khởi tạo dữ liệu mẫu cho các lớp học
function initializeClasses() {
    const classes = [
        {
            id: 1,
            name: 'Gym',
            description: 'Tập luyện với các thiết bị hiện đại',
            image: 'https://t3.ftcdn.net/jpg/05/62/71/86/360_F_562718625_BM93noP9JDAR8kiBPfRy0h4WTvUwYXNH.jpg'
        },
        {
            id: 2,
            name: 'Yoga',
            description: 'Thư giãn và cân bằng tâm trí',
            image: 'https://static.vecteezy.com/system/resources/previews/023/221/657/non_2x/yoga-day-banner-design-file-vector.jpg'
        },
        {
            id: 3,
            name: 'Zumba',
            description: 'Đốt cháy calories với những điệu nhảy sôi động',
            image: 'https://img.freepik.com/free-psd/zumba-lifestyle-banner-template_23-2149193901.jpg'
        }
    ];

    if (!localStorage.getItem('classes')) {
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    displayClasses();
}

// Hiển thị danh sách lớp học
function displayClasses() {
    const classes = JSON.parse(localStorage.getItem('classes'));
    const container = document.getElementById('classesContainer');

    container.innerHTML = classes.map(classItem => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="${classItem.image}" class="w-full h-48 object-cover" alt="${classItem.name}">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${classItem.name}</h3>
                <p class="text-gray-600">${classItem.description}</p>
                <a href="/pages/booking/schedule.html" 
                   class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Đặt lịch
                </a>
            </div>
        </div>
    `).join('');
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    initializeClasses();
}); 