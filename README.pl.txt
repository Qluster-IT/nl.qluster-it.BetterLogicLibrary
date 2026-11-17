Witamy w Better Logic Library.

Zaawansowana biblioteka logiki z zarządzaniem zmiennymi i bibliotekami dla Homey.

Ta aplikacja dostarcza Twojemu Homey lepszą logikę i biblioteki:
* Zarządzanie zmiennymi w sposób inteligentny i zintegrowany.
* Zaawansowane karty akcji i warunków z lepszą logiką, takie jak Math.js.
* Urządzenia do bezpośredniego zarządzania zmiennymi.
* Formatowanie daty i czasu, w pełni konfigurowalne, współdzielone z innymi aplikacjami.
* Kodowanie BLL i wyrażenia BLL do użycia bezpośrednio w kartach przepływu innych aplikacji.
* Funkcje niestandardowe do użycia w kodowaniu BLL i wyrażeniach BLL.
* Biblioteki do użycia w kodowaniu BLL i wyrażeniach BLL, takie jak Math.js i Lodash.
* Serwer plików, który może być używany przez inne aplikacje, takie jak Simple (Sys) LOG, do serwowania plików w Twojej sieci LAN lub pobierania ich w Homey Mobile App lub Developertools.
* Biblioteki do wykorzystania przez inne aplikacje, redukujące rozmiary aplikacji i nadmiarowości oraz poprawiające zarządzanie.
* API do zarządzania zmiennymi, używając Serwera Plików lub innych funkcji BLL.
* Karty przepływu do konwertowania obiektu/array JSON na CSV lub Excel.

Sprawdź (nowe) ustawienia aplikacji, aby uzyskać wszystkie funkcje i wyjaśnienia, takie jak kodowanie BLL w obsługiwanych aplikacjach!

Przykład kodowania BLL: Kiedy umieścisz to w argumencie tekstowym: - Witaj, dziś jest {[date("dddd")]} -, BLL automatycznie znajdzie te wyrażenia w tekstach i zdekoduje je, co daje - Witaj, dziś jest poniedziałek -.

Dalej: Zarządzaj zmiennymi bezpośrednio w przepływach!

Wystarczy wpisać nazwę zmiennej w dowolnym przypadku "when-" i "then-", a następnie wybrać ją z listy: zmienna zostanie automatycznie utworzona. 
Jeśli chcesz użyć tagu, najpierw naciśnij zapisz.
Zmienna, która została automatycznie utworzona w przepływach, zostanie również automatycznie usunięta, jeśli nie będzie już używana w kartach przepływu.
Zmiennymi można także nadal zarządzać z poziomu ekranu ustawień. Te zmienne nie zostaną automatycznie usunięte, jeśli nie są używane, ale muszą być usuwane ręcznie.

Funkcja: Dodaj $timenow$ jako specjalną zmienną dla mathjs. Pobierze to aktualny czas w sekundach od epoki. Ta zmienna nie jest przechowywana w przeglądzie, ale używana w wyrażeniach.
Funkcja: Dodano #DD (dzień), #MM (miesiąc), #YYYY (rok), #HH (godziny), #mm (minuty), #SS (sekundy) jako zastrzeżone słowa obok timenow w flowach mathjs. Możesz teraz na przykład przypisać #HH do zmiennej, aby uzyskać godziny. Ponadto zmieniłem timenow na #timenow dla spójności.

Zobacz forum społecznościowe, aby uzyskać więcej informacji!