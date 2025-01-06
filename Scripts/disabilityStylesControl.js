document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('smallerFont').addEventListener('click', function () {
        changeFontSize(-1);
    });

    document.getElementById('resetFont').addEventListener('click', function () {
        resetFontSize();
    });

    document.getElementById('boggerFont').addEventListener('click', function () {
        changeFontSize(1);
    });
});
function changeFontSize(amount) {
    let body = document.body;
    let currentSize = parseFloat(window.getComputedStyle(body).fontSize);
    body.style.fontSize = (currentSize + amount) + 'px';
}

function resetFontSize() {
    document.body.style.fontSize = '10px';  // Domyślny rozmiar czcionki
}
