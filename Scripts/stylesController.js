document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('switchTheme').addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });
});