Velkommen til Better Logic Library.

Et avansert logikkbibliotek med variabel- og bibliotekhåndtering for Homey.

Denne appen gir din Homey bedre logikk og biblioteker:
* Variabelhåndtering på en smart, integrert måte.
* Avanserte handling- og betingelseskort med bedre logikk, som Math.js.
* Enheter for direkte håndtering av variabler.
* Datoformattering, fullt tilpassbar, delt med andre apper.
* BLL-koding og BLL-uttrykk for bruk direkte innenfor andre appflytkort.
* Tilpassede funksjoner å bruke innen BLL-koding og BLL-uttrykk.
* Biblioteker til bruk innen BLL-koding og BLL-uttrykk, som Math.js og Lodash.
* En filserver som kan brukes av andre apper, som Simple (Sys) LOG, for å levere filer på LAN eller laste dem ned på Homey mobilappen eller utviklerverktøyene.
* Biblioteker for andre apper å bruke, som reduserer appstørrelser og redundanser og forbedrer håndteringen.
* API-er for variabelhåndtering, ved å bruke filserveren eller andre BLL-funksjoner.
* Flytkort for å konvertere et JSON-objekt/-array til CSV eller Excel.

Sjekk ut (nye) appinnstillinger for alle funksjoner og forklaringer, som BLL-koding i støttede apper!

Eksempel på BLL-koding: Når du plasserer dette i et tekstargument: - Hei, i dag er {[date("dddd")]} -, vil BLL automatisk finne de uttrykkene i teksten og dekode dem, noe som resulterer i - Hei, i dag er mandag -.

Videre: Håndter variabler direkte i flyter!

Bare skriv inn et variabelnavn i en når- eller da-kort og velg det fra listen: variabelen vil automatisk bli opprettet.
Hvis du vil bruke taggen, trykk lagre først.
Variabler som automatisk ble opprettet fra flyter, vil også automatisk bli slettet når de ikke lenger brukes i flytkort.
Variabler kan også fortsatt håndteres fra innstillingsskjermen. Disse variablene vil ikke automatisk bli slettet hvis de ikke brukes, men må slettes manuelt.

Funksjon: Legg til $timenow$ som en spesiell variabel for mathjs. Dette vil hente den nåværende tiden i sekunder siden epoken. Denne variabelen er ikke lagret i oversikten, men brukes i uttrykk.
Funksjon: La til #DD (dag), #MM (måned), #YYYY (år), #HH (timer), #mm (minutter) #SS (sekunder) som reserverte ord ved siden av timenow i mathjs-flyt. Du kan nå for eksempel tilordne #HH til en variabel for å få timene. Jeg endret også timenow til #timenow for konsistens.

Se fellesskapsforumet for mer informasjon!