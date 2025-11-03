document.addEventListener('DOMContentLoaded', function() {
    const openModalBtn = document.getElementById('authBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            window.location.href = 'http://localhost:8000/admin/';
        });
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            window.location.href = 'http://localhost:8000/admin/';
        });
    }
});