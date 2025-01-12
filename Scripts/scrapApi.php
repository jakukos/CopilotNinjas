<?php

function databaseConnector($path) {
    try {
        return new PDO($path);
    } catch (PDOException $e) {
        echo ("Błąd połączenia z bazą danych: " . $e->getMessage());
        exit();
    }
}

// ------------------ Skecja prowadzącego ------------------ TODO ZROBIONE
function fetchProwadzacy($imie, $nazwisko): ?array
{
    $formattedName = urlencode("$nazwisko $imie");
    $apiUrl = "https://plan.zut.edu.pl/schedule_student.php?teacher=" . $formattedName;

    $response = file_get_contents($apiUrl);
    if ($response === FALSE) {
        throw new Exception("Błąd podczas pobierania danych z API{fetchProwadzacy}.");
    }
    $data = json_decode($response, true);
    if (!empty($data[1]) && isset($data[1]['worker'])) {
        return [
            'imie' => $imie,
            'nazwisko' => $nazwisko
        ]; // Zwracamy tablicę asocjacyjną z imieniem i nazwiskiem
    }
    return null;
}


function getOrAddProwadzacy($pdo, $nazwisko, $imie)
{
    // Sprawdzamy, czy prowadzący już istnieje w bazie
    $query = $pdo->prepare("SELECT * FROM prowadzacy WHERE imie = :imie AND nazwisko = :nazwisko");
    $query->execute([':imie' => $imie, ':nazwisko' => $nazwisko]);
    $result = $query->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo "Prowadzący istnieje w bazie: " . $result['imie'] . " " . $result['nazwisko'] . "\n";
        return $result;
    } else {
        echo "Prowadzący nie istnieje w bazie. Pobieranie z API...\n";

        // Pobierz dane z API
        $apiData = fetchProwadzacy($imie, $nazwisko);

        if ($apiData) {
            // Dodaj prowadzącego do bazy
            $insertQuery = $pdo->prepare("INSERT INTO prowadzacy (imie, nazwisko) VALUES (:imie, :nazwisko)");
            $insertQuery->execute([':imie' => $imie, ':nazwisko' => $nazwisko]);
            echo "Dodano prowadzącego do bazy: $imie $nazwisko\n";
            return $apiData;
        } else {
            echo "Nie udało się pobrać danych z API.\n";
            return null;
        }
    }
}

// ------------------ Skecja budynku i sali ------------------ TODO ZROBIONE PRAWWIE
function fetchBudynekISala($wydzial, $budynek, $sala): ?array {
    echo "fetchBudynekISala: Wydział = $wydzial Budynek =  $budynek Sala = $sala\n";

    if ($budynek === $wydzial) {
        $budynek = null;
    }

    if (!empty($budynek)) {
        $queryParam = urlencode("$wydzial $budynek- $sala");
    } else {
        $queryParam = urlencode("$wydzial $sala"); // Brak budynku, przy niektorych wydzialach
    }
    //$fragmentToRemove = "WI+WI+WI1-+";
    //$result = str_replace($fragmentToRemove, "", $queryParam);
    //echo "\n$result\n";
    echo "\n$queryParam\n";
    // Budowanie URL-a
    $apiUrl = "https://plan.zut.edu.pl/schedule.php?kind=room&query=" . $queryParam;

    try {
        // Pobranie danych z API
        $response = file_get_contents($apiUrl);
        if ($response === FALSE) {
            throw new Exception("Nie udało się nawiązać połączenia z API.");
        }


        $data = json_decode($response, true);

        // Sprawdzenie i przetwarzanie odpowiedzi
        if (!empty($data[0]) && isset($data[0]['item'])) {
            $item = $data[0]['item']; // Przykład: "WI WI1- 307"
            $parts = explode(" ", $item, 2); // Rozdzielenie na wydział i resztę

            $wydzial = $parts[0] ?? $wydzial; // Wydział
            $budynekSala = isset($parts[1]) ? explode("-", $parts[1], 2) : [];
            $budynek = trim($budynekSala[0] ?? "");
            $sala = trim($budynekSala[1] ?? $sala);

            return [
                'wydzial' => $wydzial,
                'budynek' => $budynek,
                'sala' => $sala,
            ];
        }

        echo "API zwróciło pustą lub niepoprawną odpowiedź dla zapytania{fetchBudynekSala}: $apiUrl\n";
        return null;

    } catch (Exception $e) {
        echo "Błąd podczas pobierania danych z API: " . $e->getMessage() . "\n";
        return null;
    }
}

function getBudynekISala($pdo, $wydzial, $budynek, $sala) {
    try {
        // Pobierz dane budynku i sali z API
        echo "\ngetBudynek [Wydzial = $wydzial | Budynek = $budynek | Sala = $sala]\n";
        $budynekSalaData = fetchBudynekISala($wydzial, $budynek, $sala);

        if (!$budynekSalaData) {
            echo "Błąd: Nie udało się pobrać danych budynku i sali z API.\n";
            return null;
        }

        // Przypisanie wartości z wyniku API
        $wydzial = $budynekSalaData['wydzial'];
        $budynek = $budynekSalaData['budynek'];
        $sala = $budynekSalaData['sala'];

        // Sprawdź, czy budynek istnieje w bazie
        $queryBudynek = $pdo->prepare("SELECT budynekID FROM budynek WHERE budynekID = :budynekID");
        $queryBudynek->execute([':budynekID' => $budynek]);
        $existingBudynek = $queryBudynek->fetchColumn();

        if (!$existingBudynek) {
            echo "Dodawanie nowego budynku (wydziału): $budynek\n";
            $insertBudynek = $pdo->prepare("INSERT INTO budynek (budynekID, nazwa) VALUES (:budynekID, :nazwa)");
            $insertBudynek->execute([':budynekID' => $budynek, ':nazwa' => $budynek]);
        }

        // Sprawdź, czy sala istnieje w bazie
        $querySala = $pdo->prepare("SELECT salaID FROM sala WHERE numer_sali = :numer_sali AND budynekID = :budynekID");
        $querySala->execute([':numer_sali' => $sala, ':budynekID' => $budynek]);
        $salaID = $querySala->fetchColumn();

        if (!$salaID) {
            echo "Dodawanie nowej sali: $sala w budynku $budynek\n";
            $insertSala = $pdo->prepare("INSERT INTO sala (numer_sali, budynekID, numerSalii) VALUES (:numer_sali, :budynekID, :numerSalii)");
            $insertSala->execute([
                ':numer_sali' => $sala,
                ':budynekID' => $budynek,
                ':numerSalii' => $sala,
            ]);
            $salaID = $pdo->lastInsertId();
        }

        return [
            'budynekID' => $budynek,
            'salaID' => $salaID,
        ];

    } catch (PDOException $e) {
        echo "Błąd: " . $e->getMessage();
        return null;
    }
}



function getSala()
{

}
// ------------------ Skecja prowadzącego ------------------ TODO ZROBIONE
function fetchNumerAlbumu($numerAlbumu): bool {
    // Tworzymy URL z numerem albumu
    $apiUrl = "https://plan.zut.edu.pl/schedule_student.php?number=" . urlencode($numerAlbumu);

    // Pobieranie danych z API
    $response = file_get_contents($apiUrl);
    if ($response === FALSE) {
        throw new Exception("Błąd podczas pobierania danych z API {numer albumu}.");
    }


    $data = json_decode($response, true);

    // Jeśli odpowiedź API nie jest pustą tablicą, zwracamy true
    return !empty($data);
}
function getOrAddNumerAlbumu($pdo, $numerAlbumu) {
    try {
        // Sprawdź, czy numer albumu istnieje w bazie
        $query = $pdo->prepare("SELECT studentID FROM studentID WHERE numer_indeksu = :numer_indeksu");
        $query->execute([':numer_indeksu' => $numerAlbumu]);
        $studentID = $query->fetchColumn();

        if ($studentID) {
            echo "Numer albumu istnieje w bazie: $numerAlbumu\n";
            return $studentID;
        } else {
            echo "Numer albumu nie istnieje w bazie. Sprawdzanie w API...\n";

            // Sprawdź numer albumu w API
            if (fetchNumerAlbumu($numerAlbumu)) {
                // Dodaj numer albumu do bazy
                $insert = $pdo->prepare("INSERT INTO studentID (numer_indeksu) VALUES (:numer_indeksu)");
                $insert->execute([':numer_indeksu' => $numerAlbumu]);
                $studentID = $pdo->lastInsertId();
                echo "Dodano numer albumu: $numerAlbumu\n";
                return $studentID;
            } else {
                echo "Numer albumu nie został znaleziony w API.\n";
                return null;
            }
        }
    } catch (PDOException $e) {
        echo "Błąd: " . $e->getMessage();
        return null;
    }
}

// ------------------ Skecja przedmiotu i grupy ------------------ TODO ZROBIONE
function fetchPrzedmioty($numerIndeksu, $start, $end): array {
    // Formatowanie zapytania do API
    $apiUrl = "https://plan.zut.edu.pl/schedule_student.php?number=" . urlencode($numerIndeksu) .
        "&start=" . urlencode($start) .
        "&end=" . urlencode($end);

    try {
        // Pobranie danych z API
        $response = file_get_contents($apiUrl);
        if ($response === FALSE) {
            throw new Exception("Nie udało się nawiązać połączenia z API.");
        }

        $data = json_decode($response, true);

        // Filtracja i ekstrakcja unikalnych przedmiotów
        $przedmioty = [];
        foreach ($data as $item) {
            if (!empty($item['subject'])) {
                $przedmioty[] = $item['subject'];
            }
        }

        // Usunięcie duplikatów
        return array_unique($przedmioty);

    } catch (Exception $e) {
        echo "Błąd podczas pobierania danych z API {przedmioty}: " . $e->getMessage() . "\n";
        return [];
    }
}
function getOrAddPrzedmiot($pdo, $przedmioty) {
    try {
        $addedPrzedmioty = [];

        foreach ($przedmioty as $przedmiot) {
            // Sprawdzenie, czy przedmiot już istnieje w bazie
            $query = $pdo->prepare("SELECT przedmiotID FROM przedmiot WHERE nazwa = :nazwa");
            $query->execute([':nazwa' => $przedmiot]);
            $przedmiotID = $query->fetchColumn();

            if (!$przedmiotID) {
                echo "Przedmiot '$przedmiot' nie istnieje w bazie. Dodawanie do bazy...\n";

                // Dodanie przedmiotu do bazy
                $insert = $pdo->prepare("INSERT INTO przedmiot (nazwa) VALUES (:nazwa)");
                $insert->execute([':nazwa' => $przedmiot]);
                $przedmiotID = $pdo->lastInsertId();
                echo "Dodano przedmiot: $przedmiot\n";
            } else {
                echo "Przedmiot '$przedmiot' już istnieje w bazie.\n";
            }

            // Dodaj przedmiot do listy zwracanej
            $addedPrzedmioty[] = [
                'przedmiotID' => $przedmiotID,
                'nazwa' => $przedmiot
            ];
        }

        return $addedPrzedmioty;

    } catch (PDOException $e) {
        echo "Błąd w bazie danych: " . $e->getMessage() . "\n";
        return [];
    }
}
// ------------------ Sekcja przedmiotu------------------ TODO
function fetchZajecia($numerIndeksu, $start, $end): array {
    // Formatowanie zapytania do API
    $apiUrl = "https://plan.zut.edu.pl/schedule_student.php?number=" . urlencode($numerIndeksu) .
        "&start=" . urlencode($start) .
        "&end=" . urlencode($end);

    try {
        // Pobranie danych z API
        $response = file_get_contents($apiUrl);
        if ($response === FALSE) {
            throw new Exception("Nie udało się nawiązać połączenia z API.");
        }

        // Dekodowanie odpowiedzi JSON
        return json_decode($response, true);

    } catch (Exception $e) {
        echo "Błąd podczas pobierania danych z API {fetchZajecia}: " . $e->getMessage() . "\n";
        return [];
    }
}

function getOrAddZajecia($pdo, $numerIndeksu, $start, $end) {
    // Pobranie danych zajęć z API
    $zajeciaData = fetchZajecia($numerIndeksu, $start, $end);

    if (empty($zajeciaData)) {
        echo "Brak zajęć w podanym zakresie dla numeru indeksu: $numerIndeksu.\n";
        return;
    }

    foreach ($zajeciaData as $lesson) {
        // Pominięcie pustych rekordów
        if (count($lesson) === 0 || !isset($lesson)) {
            continue;
        }

        // Pobranie danych z pojedynczego zajęcia
        $wykladowca = $lesson["worker"] ?? null;
        $grupa = $lesson["group_name"] ?? null;
        $sala = $lesson["room"] ?? null;
        $przedmiot = $lesson["subject"] ?? null;
        $tytul = $lesson["title"] ?? null;
        $opis = $lesson["description"] ?? null;
        $lessonStart = $lesson["start"] ?? null;
        $lessonEnd = $lesson["end"] ?? null;
        $form = $lesson["lesson_form"] ?? null;

        if (!$tytul || !$wykladowca || !$przedmiot || !$sala || !$lessonStart || !$lessonEnd) {
            echo "Pominięto zajęcia z powodu brakujących danych.{getOrAddZajecia}\n";
            continue;
        }

        // Rozdzielenie imienia i nazwiska prowadzącego
        list($nazwisko, $imie) = explode(" ", $wykladowca, 2);

        // Pobranie lub dodanie prowadzącego
        $prowadzacy = getOrAddProwadzacy($pdo, $nazwisko, $imie);
        $prowadzacyID = $prowadzacy['prowadzacyID'] ?? null;

        if (!$prowadzacyID) {
            echo "Błąd: Nie udało się znaleźć lub dodać prowadzącego: $wykladowca.\n";
            continue;
        }

        // Ustalanie wydziału i budynku na podstawie sali
        if (str_contains($sala, "SWFiS")) {
            $wydzial = "SWFiS";
            $budynek = "HS";
        } elseif (preg_match('/WI\d/', $sala)) {
            $wydzial = "WI";
            $budynek = explode("-", $sala)[0];
        } else {
            $wydzial = "Nieokreślony";
            $budynek = null;
        }
        echo ("GetOrAddZajecia: Wydzial = $wydzial Budynek = $budynek Sala = $sala\n");
        // Pobranie lub dodanie budynku i sali
        $budynekSalaData = getBudynekISala($pdo, $wydzial, $budynek, $sala);
        $salaID = $budynekSalaData['salaID'] ?? null;

        if (!$salaID) {
            echo "Błąd: Nie udało się znaleźć lub dodać sali: $sala.\n";
            continue;
        }

        // Pobranie lub dodanie przedmiotu
        $przedmiotData = getOrAddPrzedmiot($pdo, [$przedmiot]);
        $przedmiotID = $przedmiotData[0]['przedmiotID'] ?? null;

        if (!$przedmiotID) {
            echo "Błąd: Nie udało się znaleźć lub dodać przedmiotu: $przedmiot.\n";
            continue;
        }

        // Pobranie lub dodanie grupy
        $queryGrupa = $pdo->prepare("SELECT groupID FROM grupa WHERE nazwa = :nazwa");
        $queryGrupa->execute([':nazwa' => $grupa]);
        $grupaID = $queryGrupa->fetchColumn();
        if (!$grupaID) {
            $insertGrupa = $pdo->prepare("INSERT INTO grupa (nazwa) VALUES (:nazwa)");
            $insertGrupa->execute([':nazwa' => $grupa]);
            $grupaID = $pdo->lastInsertId();
        }

        // Sprawdź, czy zajęcia już istnieją w bazie
        $queryZajecia = $pdo->prepare("
            SELECT zajeciaID FROM zajecia 
            WHERE tytul = :tytul AND start = :start AND koniec = :koniec AND salaID = :salaID
        ");
        $queryZajecia->execute([
            ':tytul' => $tytul,
            ':start' => $lessonStart,
            ':koniec' => $lessonEnd,
            ':salaID' => $salaID,
        ]);
        $zajeciaID = $queryZajecia->fetchColumn();

        if (!$zajeciaID) {
            // Dodanie nowych zajęć do bazy
            $insertZajecia = $pdo->prepare("
                INSERT INTO zajecia (prowadzacyID, przedmiotID, grupaID, salaID, tytul, opis, start, koniec, formaZajec) 
                VALUES (:prowadzacyID, :przedmiotID, :grupaID, :salaID, :tytul, :opis, :start, :koniec, :formaZajec)
            ");
            $insertZajecia->execute([
                ':prowadzacyID' => $prowadzacyID,
                ':przedmiotID' => $przedmiotID,
                ':grupaID' => $grupaID,
                ':salaID' => $salaID,
                ':tytul' => $tytul,
                ':opis' => $opis,
                ':start' => $lessonStart,
                ':koniec' => $lessonEnd,
                ':formaZajec' => $form,
            ]);
            echo "Dodano zajęcia: $tytul\n";
        } else {
            echo "Zajęcia '$tytul' już istnieją w bazie.\n";
        }
    }
}



function getGrupa()
{

}


$pdo = databaseConnector("sqlite:./scrapBaza.db");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$DEBUG = TRUE;
if ($DEBUG == TRUE) {
// 1) Testowanie funkcji getOrAddProwadzacy
    echo "=== TEST 1: getOrAddProwadzacy ===\n";
    $nazwisko = "Karczmarczyk";
    $imie = "Aleksandra";
    $prowadzacy = getOrAddProwadzacy($pdo, $nazwisko, $imie);

    if ($prowadzacy) {
        echo "Prowadzacy znaleziony: " . $prowadzacy['imie'] . " " . $prowadzacy['nazwisko'] . "\n\n";
    } else {
        echo "Prowadzacy nie znaleziony.\n\n";
    }

// 2) Testowanie funkcji getBudynekISala
    echo "=== TEST 2: getBudynekISala ===\n";
    $wydzial = "WI";   // np. Wydział Informatyki
    $budynek = "WI1";  // Budynek w ramach wydziału
    $sala = "307";     // Numer sali

    $budynekSalaData = getBudynekISala($pdo, $wydzial, $budynek, $sala);

    if ($budynekSalaData) {
        echo "Budynek (wydzial) ID: " . $budynekSalaData['budynekID'] . "\n";
        echo "Sala ID: " . $budynekSalaData['salaID'] . "\n\n";
    } else {
        echo "Nie udalo sie znalezc ani dodac budynku (wydzialu) i sali.\n\n";
    }

// 3) Testowanie funkcji getOrAddNumerAlbumu
    echo "=== TEST 3: getOrAddNumerAlbumu ===\n";
    $numerAlbumu = "53906"; // Przykładowy numer albumu
    $studentID = getOrAddNumerAlbumu($pdo, $numerAlbumu);

    if ($studentID) {
        echo "Student ID: $studentID\n\n";
    } else {
        echo "Nie udalo sie znalezc ani dodac numeru albumu.\n\n";
    }

// 4) Testowanie pobierania przedmiotów z API i dodawania do bazy
    echo "=== TEST 4: fetchPrzedmioty & getOrAddPrzedmiot ===\n";
// Parametry do pobierania przedmiotów
    $start = "2025-01-06";   // Początek zakresu
    $end = "2025-01-30";     // Koniec zakresu

// Pobranie przedmiotów z API
    $przedmioty = fetchPrzedmioty($numerAlbumu, $start, $end);

// Sprawdzenie i dodanie przedmiotów do bazy
    if (!empty($przedmioty)) {
        $result = getOrAddPrzedmiot($pdo, $przedmioty);

        echo "Dodane przedmioty:\n";
        foreach ($result as $przedmiot) {
            echo "- ID: " . $przedmiot['przedmiotID'] . ", Nazwa: " . $przedmiot['nazwa'] . "\n";
        }
        echo "\n";
    } else {
        echo "Brak przedmiotow do dodania.\n\n";
    }

// 5) Testowanie funkcji getOrAddZajecia
    echo "=== TEST 5: getOrAddZajecia ===\n";

    getOrAddZajecia($pdo, $numerAlbumu, $start, $end);
    echo "Sprawdz w bazie, czy zajecia zostaly dodane.\n\n";

// 6) Testowanie getBudynekISala
    echo "=== TEST 6: getBudynekISala (ponownie) ===\n";
// Używamy tych samych parametrów: $wydzial, $budynek, $sala
    $result = getBudynekISala($pdo, $wydzial, $budynek, $sala);

    if ($result) {
        echo "Budynek ID: " . $result['budynekID'] . "\n";
        echo "Sala ID: " . $result['salaID'] . "\n\n";
    } else {
        echo "Nie udalo sie dodac budynku i sali.\n\n";
    }
}