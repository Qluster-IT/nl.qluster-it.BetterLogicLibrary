Velkommen til Better Logic Library.

Et avanceret logikbibliotek med variabel- og bibliotekstyring til Homey.

Denne app giver din Homey Better Logic og Libraries:
* Variabelhåndtering på en smart, integreret måde.
* Avancerede handlings- og betingelseskort med Better Logic, som Math.js.
* Enheder til direkte håndtering af variablerne.
* Datotidsformatering, fuldt tilpasselig, delt med andre apps.
* BLL-kodning og BLL-udtryk til direkte brug i andre apps flowkort.
* Brugerdefinerede funktioner til brug inden for BLL-kodning og BLL-udtryk.
* Biblioteker til brug inden for BLL-kodning og BLL-udtryk, som Math.js og Lodash.
* En filserver, der kan bruges af andre apps, som Simple (Sys) LOG, til at levere filer på dit LAN eller til at downloade dem på Homey Mobile App eller Developer Tools.
* Biblioteker til andre apps til at bruge, hvilket reducerer app-størrelser og redundanser og forbedrer styringen.
* API'er til variabelhåndtering, ved hjælp af filserveren eller andre BLL-funktioner.
* Flowkort til at konvertere et JSON-objekt/array til CSV eller Excel.

Tjek de (nye) appindstillinger for alle funktioner og forklaringer, som BLL-kodning i understøttede apps!

Eksempel på BLL-kodning: Når du placerer dette i et tekstargument: - Hej, i dag er det {[date("dddd")]} -, vil BLL automatisk finde disse udtryk i teksten og afkode dem, hvilket resulterer i - Hej, i dag er det mandag -.

Yderligere: Håndter variabler direkte i flows!

Bare skriv et variabelnavn i et hvilket som helst når- og så-kort og vælg det fra listen: variablen vil blive automatisk oprettet.
Hvis du vil bruge tagget, skal du først trykke på gem.
Variabler, der blev automatisk oprettet fra flows, vil også automatisk blive slettet, når de ikke længere bruges i flowkort.
Variabler kan stadig håndteres fra indstillingsskærmen. Disse variabler vil ikke automatisk blive slettet, hvis de ikke bruges, men skal slettes manuelt.

Funktion: Tilføj $timenow$ som en speciel variabel til mathjs. Dette vil hente den aktuelle tid i sekunder siden epoch. Denne variabel gemmes ikke i oversigten, men bruges i udtryk.
Funktion: Tilføjet #DD (dag), #MM (måned), #YYYY (år), #HH (timer), #mm (minutter), #SS (sekunder) som reserverede ord ved siden af timenow i mathjs-flows. Du kan nu for eksempel tildele #HH til en variabel for at få timerne. Jeg har også ændret timenow til #timenow for konsistens.

Se community-forummet for mere information!