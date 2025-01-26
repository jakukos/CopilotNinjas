document.addEventListener('DOMContentLoaded', function () {

    // SKRYPTY OD PATRYKA TAK O WKLEJONE bo łączyc to to za duzo robotaju ide sie uczyć algo 😒
    const tabButtons = document.querySelectorAll('.tab-button');
    const schedules = document.querySelectorAll('.schedule');
    const footer = document.querySelector('.footer');
    const toggle = document.querySelector('.footer .toggle');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Usuń klasę 'active' z obecnie aktywnego przycisku i ustaw nową
            document.querySelector('.tab-button.active').classList.remove('active');
            button.classList.add('active');

            // Aktualizuj harmonogram (schedule)
            schedules.forEach(schedule => schedule.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');

            // Zmień wartość w elemencie #currentDate
            const currentDateElement = document.getElementById('currentDate').querySelector('span');
            const today = new Date();

            if (button.dataset.tab === 'day') {
                // Ustaw aktualną datę w formacie "January 13, 2025"
                currentDateElement.textContent = today.toLocaleDateString('pl-PL', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                });
                // Dane wydarzeń
                const events = [
                    { name: "Sztuczna Inteligencja", start: "09:25", end: "11:45", type: "lecture" },
                    { name: "Angielski", start: "12:00", end: "13:30", type: "lektorat" },
                    { name: "Programowanie", start: "14:00", end: "15:45", type: "laboratory" }
                ];


// Funkcja przeliczająca czas na pozycję w pikselach (przykład dla przedziału 1 godzina = 100px)
                // Funkcja przeliczająca czas na pozycję w pikselach w harmonogramie od 7:00 do 24:00
                function timeToPosition(time) {
                    const [hours, minutes] = time.split(':').map(Number);
                    const startHour = 7; // Startowy czas harmonogramu
                    const pixelsPerHour = 30; // Wysokość przypisana do jednej godziny (100px na godzinę)

                    // Obliczamy przesunięcie od godziny 7:00
                    const normalizedHours = hours - startHour;
                    return normalizedHours * pixelsPerHour + (minutes / 60) * pixelsPerHour;
                }


// Generowanie kart
                function generateEvents(events) {
                    const container = document.querySelector('.cardsContainer');

                    events.forEach(event => {
                        const eventElement = document.createElement('div');
                        const startPx = timeToPosition(event.start);
                        const endPx = timeToPosition(event.end);
                        const height = endPx - startPx;

                        eventElement.className = `event ${event.type}`;
                        eventElement.style.top = `${startPx}px`;


                        eventElement.innerHTML = `${event.name}<br>${event.start} - ${event.end}`;

                        container.appendChild(eventElement);
                    });
                }

// Wywołanie funkcji generującej
                generateEvents(events);

            } else if (button.dataset.tab === 'week') {
                // Oblicz zakres bieżącego tygodnia
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Poniedziałek
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Niedziela

                currentDateElement.textContent = `${startOfWeek.toLocaleDateString('pl-PL', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('pl-PL', { month: 'long', day: 'numeric', year: 'numeric' })}`;
            } else if (button.dataset.tab === 'month') {
                // Wyświetl bieżący miesiąc
                currentDateElement.textContent = today.toLocaleDateString('pl-PL', {
                    month: 'long',
                    year: 'numeric',
                });
            }
        });
    });


    toggle.addEventListener('click', () => {
        footer.classList.toggle('collapsed');
        toggle.textContent = footer.classList.contains('collapsed') ? '∧' : '∨';
    });

    function handleCheckboxVisibility() {
        // Pobierz stan każdego checkboxa
        const showLectures = document.getElementById('lecture-checkbox').checked;
        const showLaboratories = document.getElementById('laboratory-checkbox').checked;
        const showExercises = document.getElementById('exercises-checkbox').checked;
        const showLektorat = document.getElementById('lektorat-checkbox').checked;

        // Pokaż lub ukryj odpowiednie wydarzenia
        document.querySelectorAll('.event.lecture').forEach(event => {
            event.style.display = showLectures ? 'block' : 'none';
        });

        document.querySelectorAll('.event.laboratory').forEach(event => {
            event.style.display = showLaboratories ? 'block' : 'none';
        });

        document.querySelectorAll('.event.exercises').forEach(event => {
            event.style.display = showExercises ? 'block' : 'none';
        });

        document.querySelectorAll('.event.lektorat').forEach(event => {
            event.style.display = showLektorat ? 'block' : 'none';
        });
    }

    // Nasłuchiwanie zmian na checkboxach
    document.getElementById('lecture-checkbox').addEventListener('change', handleCheckboxVisibility);
    document.getElementById('laboratory-checkbox').addEventListener('change', handleCheckboxVisibility);
    document.getElementById('exercises-checkbox').addEventListener('change', handleCheckboxVisibility);
    document.getElementById('lektorat-checkbox').addEventListener('change', handleCheckboxVisibility);
    // Uruchom funkcję na starcie, aby ustawić widoczność zgodnie z początkowym stanem checkboxów
    handleCheckboxVisibility();

    // Funkcja do zapisywania danych w ciasteczkach
    function saveToCookies() {
        alert()
        // Pobranie wartości z pól tekstowych
        const inputs = document.querySelectorAll('.footerSection .inputContainer input');
        inputs.forEach((input, index) => {
            document.cookie = `input${index}=${encodeURIComponent(input.value)}; path=/; max-age=31536000;`;
        });

        // Pobranie stanu checkboxów
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            document.cookie = `checkbox${index}=${checkbox.checked}; path=/; max-age=31536000;`;
        });

        // Wyświetlanie komunikatu
        const notification = document.createElement('div');
        notification.textContent = 'Dane zostały zapisane do ciasteczek!';
        notification.style.position = 'fixed';
        notification.style.bottom = '10px';
        notification.style.right = '10px';
        notification.style.backgroundColor = '#4caf50';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        document.body.appendChild(notification);

        // Usunięcie komunikatu po 3 sekundach
        setTimeout(() => {
            notification.remove();
        }, 3000);

    }

// Funkcja do odczytywania danych z ciasteczek
    function loadFromCookies() {
        // Odczyt wartości pól tekstowych
        const inputs = document.querySelectorAll('.footerSection .inputContainer input');
        inputs.forEach((input, index) => {
            const value = getCookie(`input${index}`);
            if (value) {
                input.value = decodeURIComponent(value);
            }
        });

        // Odczyt stanu checkboxów
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            const value = getCookie(`checkbox${index}`);
            if (value) {
                checkbox.checked = value === 'true';
            }
        });

    }

// Funkcja pomocnicza do pobierania wartości ciasteczka
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === name) {
                return value;
            }
        }

        return null;
    }

// Podpięcie funkcji zapisu do przycisku
    document.querySelector('#save').addEventListener('click', saveToCookies);

// Ładowanie danych z ciasteczek przy starcie strony
    window.addEventListener('DOMContentLoaded', loadFromCookies);


    function generateLink() {
        // Pobranie danych z inputów
        const inputs = document.querySelectorAll('.footerSection .inputContainer input');
        const inputParams = Array.from(inputs).map((input, index) => {
            return `input${index}=${encodeURIComponent(input.value)}`;
        });

        // Pobranie danych z checkboxów
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        const checkboxParams = Array.from(checkboxes).map((checkbox, index) => {
            return `checkbox${index}=${checkbox.checked}`;
        });

        // Łączenie parametrów
        const queryParams = [...inputParams, ...checkboxParams].join('&');

        // Generowanie pełnego linku
        const link = `${window.location.origin}${window.location.pathname}?${queryParams}`;
        navigator.clipboard.writeText(link).then(() => {
            alert("Link został skopiowany do schowka!");
        }).catch(err => {
            console.error("Błąd podczas kopiowania do schowka:", err);
        });
        return link;
    }

    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Ustawienie danych w inputach
        const inputs = document.querySelectorAll('.footerSection .inputContainer input');
        inputs.forEach((input, index) => {
            const value = params.get(`input${index}`);
            if (value !== null) {
                input.value = decodeURIComponent(value);
            }
        });

        // Ustawienie stanów checkboxów
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            const value = params.get(`checkbox${index}`);
            if (value !== null) {
                checkbox.checked = value === 'true';
            }
        });
    }

    document.querySelector('#share').addEventListener('click', generateLink);

// Wywołanie funkcji przy starcie strony
    window.addEventListener('DOMContentLoaded', loadFromURL);

    //---------- KONIEC SKRYPTÓW PATRYK ------------
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