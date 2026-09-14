Witamy w Bibliotece Better Logic.

Zaawansowana biblioteka logiki z zarządzaniem zmiennymi i bibliotekami dla Homey.

Ta aplikacja dostarcza Twojemu Homey Better Logic i Biblioteki:
* Zarządzanie zmiennymi w inteligentny, zintegrowany sposób.
* Zaawansowane karty akcji i warunków z Better Logic, takie jak Math.js.
* Urządzenia do bezpośredniego zarządzania zmiennymi.
* Formatowanie daty i czasu, w pełni konfigurowalne, udostępniane z innymi aplikacjami.
* Pisanie i wyrazy BLL do bezpośredniego użycia w innych kartach przepływów aplikacji.
* Funkcje niestandardowe do użycia w pisaniu i wyrażeniach BLL.
* Biblioteki do użycia w pisaniu i wyrażeniach BLL, takie jak Math.js i Lodash.
* Serwer plików, który może być wykorzystywany przez inne aplikacje, takie jak Simple (Sys) LOG, do serwowania plików w Twojej sieci LAN lub do ich pobierania na aplikację mobilną Homey lub narzędzia deweloperskie.
* Biblioteki do wykorzystania przez inne aplikacje, zmniejszając rozmiary aplikacji i redundancje oraz poprawiając zarządzanie.
* API do zarządzania zmiennymi, używając serwera plików lub innych funkcji BLL.

Sprawdź (nowe) ustawienia aplikacji, aby poznać wszystkie funkcje i wyjaśnienia, takie jak pisanie BLL w obsługiwanych aplikacjach!

Przykład pisania BLL: Kiedy umieścisz to w argumencie tekstowym: - Cześć, dzisiaj jest {[date("dddd")]}, - BLL automatycznie znajdzie te wyrażenia w tekstach i je zdekoduje, skutkując - Cześć, dzisiaj jest poniedziałek -.

Dalej: Zarządzaj zmiennymi bezpośrednio w przepływach!

Po prostu wpisz nazwę zmiennej w dowolnej karcie "kiedy" i "następnie" i wybierz ją z listy: zmienna zostanie automatycznie utworzona. Jeśli chcesz użyć tagu, najpierw naciśnij zapisz.
Zmienny, które zostały automatycznie utworzone w przepływach, zostaną również automatycznie usunięte, gdy nie będą już używane w kartach przepływów.
Zmiennymi można również zarządzać z poziomu ekranu ustawień. Te zmienne nie zostaną automatycznie usunięte, jeśli nie będą używane, ale trzeba je usunąć ręcznie.

I przycisk Usuń wszystko ma teraz potwierdzenie!

* Funkcja: Dodano wsparcie dla API do GET, GET wszystkich zmiennych i SET (post) wartości.
    * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
    * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Pobierz wszystkie zmienne)
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  // Upewnij się, że wartość pasuje do typu, w przeciwnym razie nie zostanie ustawiona.
* Funkcja: Wyzwalacz dla API. Wywołanie
    * PUT dla inkrementacji: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME To wywoła daną zmienną
* Funkcja: Dodaj zwiększanie lub zmniejszanie do API. Wywołanie
    * PUT dla inkrementacji: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Zwiększa zmienną o podaną wartość
    * PUT dla dekrementacji: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Zmniejsza zmienną o podaną wartość
* Funkcja: Dodaj włączanie/wyłączanie booleana (true->false lub false->true) do wsparcia API
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle To wymusi odwrócenie wartości boolean

* Funkcja: Dodaj $timenow$ jako specjalną zmienną dla mathjs. To pobierze aktualny czas w sekundach od początku epoki. Ta zmienna nie jest przechowywana w przeglądzie, ale używana w wyrażeniach.
* Funkcja: Dodano #DD (dzień), #MM (miesiąc), #YYYY (rok), #HH (godziny), #mm (minuty) #SS (sekundy) jako zarezerwowane słowa obok timenow w przepływach mathjs. Teraz możesz na przykład przypisać #HH do zmiennej, aby uzyskać godziny. Zmieniłem timenow na #timenow dla spójności.