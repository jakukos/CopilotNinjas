document.addEventListener('DOMContentLoaded', function () {
    // Przechowywanie poprzednich danych formularza
    let previousData = {
        teacher: '',
        classRoom: '',
        groupNumber: '',
        albumNumber: ''
    };

    // Funkcja, która będzie porównywać dane z poprzednimi
    function checkFormChanges() {
        const teacher = document.getElementById('teaacher').value;
        const classRoom = document.getElementById('classRoom').value;
        const groupNumber = document.getElementById('groupNumber').value;
        const albumNumber = document.getElementById('albumNumber').value;

        if (
            teacher === previousData.teacher &&
            classRoom === previousData.classRoom &&
            groupNumber === previousData.groupNumber &&
            albumNumber === previousData.albumNumber
        ) {
            // Jeśli dane się nie zmieniły, wyłączamy przycisk "Wyszukaj"
            document.getElementById('search').disabled = true;
        } else {
            // Jeśli dane się zmieniły, włączamy przycisk "Wyszukaj"
            document.getElementById('search').disabled = false;
        }
    }

    // Funkcja przełączająca widok porównania
    function toggleCompareView() {
        const timetableContainer = document.querySelector('.timetable');
        timetableContainer.classList.toggle('compare');
        const compareBtn = document.getElementById('compare');

        // Przełączamy stan przycisku
        if (timetableContainer.classList.contains('compare')) {
            compareBtn.textContent = 'Anuluj porównanie';
        } else {
            compareBtn.textContent = 'Porównaj';
        }
    }

    // Funkcja, która zapisuje dane formularza, aby śledzić zmiany
    function updatePreviousData() {
        previousData.teacher = document.getElementById('teaacher').value;
        previousData.classRoom = document.getElementById('classRoom').value;
        previousData.groupNumber = document.getElementById('groupNumber').value;
        previousData.albumNumber = document.getElementById('albumNumber').value;
    }

    // Inicjalizacja
    document.getElementById('compare').addEventListener('click', toggleCompareView);
    document.querySelectorAll('#teaacher, #classRoom, #groupNumber, #albumNumber').forEach(input => {
        input.addEventListener('input', checkFormChanges);
    });
    document.getElementById('search').addEventListener('click', updatePreviousData);
});
