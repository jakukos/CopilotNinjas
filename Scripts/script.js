document.addEventListener('DOMContentLoaded', function () {
    // Kod z pliku disabilityStylesControl.js
    document.getElementById('smallerFont').addEventListener('click', function () {
        changeFontSize(-1);
    });

    document.getElementById('resetFont').addEventListener('click', function () {
        resetFontSize();
    });

    document.getElementById('boggerFont').addEventListener('click', function () {
        changeFontSize(1);
    });

    function changeFontSize(amount) {
        let body = document.body;
        let currentSize = parseFloat(window.getComputedStyle(body).fontSize);
        body.style.fontSize = (currentSize + amount) + 'px';
    }

    function resetFontSize() {
        document.body.style.fontSize = '10px'; // Domyślny rozmiar czcionki
    }

    // Kod z pliku filterMenu.js
    let previousData = {
        teacher: '',
        classRoom: '',
        groupNumber: '',
        albumNumber: ''
    };

    function checkFormChanges() {
        const teacher = document.getElementById('teacher').value;
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

    function toggleCompareView() {
        const timetableContainer = document.querySelector('.timetable');
        timetableContainer.classList.toggle('compare');
        const compareBtn = document.getElementById('compare');

        if (timetableContainer.classList.contains('compare')) {
            compareBtn.textContent = 'Anuluj porównanie';
        } else {
            compareBtn.textContent = 'Porównaj';
        }
    }

    function updatePreviousData() {
        previousData.teacher = document.getElementById('teacher').value;
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

    // Kod z pliku getResponse.js
    document.getElementById('search').addEventListener('click', function () {
        console.log(document.getElementById('teacher').value);
        const teacher = document.getElementById('teacher').value;
        const classRoom = document.getElementById('classRoom').value;
        const groupNumber = document.getElementById('groupNumber').value;
        const albumNumber = document.getElementById('albumNumber').value;

        fetch('../Scripts/apiScraper.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({teacher, classRoom, groupNumber, albumNumber})
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Błąd:', error));
    });

    // Kod z pliku stylesController.js
    document.getElementById('switchTheme').addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });

    // Kod z pliku timeIntervalSwitcher.js
    function changeTimeView(view) {
        const allSections = document.querySelectorAll('#daily, #weekly, #monthly');
        allSections.forEach(section => section.classList.remove('active'));

        const activeTimeView = document.getElementById(view);
        if (activeTimeView)
            activeTimeView.classList.add('active');
    }

    function changeView(view) {
        changeTimeView(view);
    }

    function toggleMenu() {
        const menu = document.getElementById('timeMenu');
        menu.classList.toggle('active');
    }

});