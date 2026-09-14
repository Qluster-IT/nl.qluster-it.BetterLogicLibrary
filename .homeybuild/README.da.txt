Velkommen til Better Logic Library.

Et avanceret logikbibliotek med variabel- og biblioteksstyring for Homey.

Denne app leverer din Homey med Better Logic og Biblioteker:
* Variabelstyring på en smart, integreret måde.
* Avancerede handlings- og betingelseskort med Better Logic, som Math.js.
* Enheder til direkte styring af variablerne.
* Datotidsformatering, fuldt tilpasselig, delt med andre apps.
* BLL-kodning og BLL-udtryk til direkte brug inden for andre apps flowkort.
* Tilpassede funktioner til brug inden for BLL-kodning og BLL-udtryk.
* Biblioteker til brug inden for BLL-kodning og BLL-udtryk, som Math.js og Lodash.
* En Filserver, der kan bruges af andre apps, som Simple (Sys) LOG, til at levere filer på dit LAN eller downloade dem på Homey Mobile App eller Udviklerværktøjer.
* Biblioteker til forbrug af andre Apps, der reducerer app-størrelser og redundanser og forbedrer styringen.
* API'er til variabelstyring, ved hjælp af Filserveren eller andre BLL-funktioner.

Tjek de (nye) App Indstillinger for alle funktioner og forklaringer, som BLL-kodning i understøttede apps!

Eksempel på BLL-kodning: Når du placerer dette inden for et tekstargument: - Hej, i dag er {[date("dddd")]} -, vil BLL automatisk finde de udtryk inden for teksterne og afkode dem, hvilket resulterer i - Hej, i dag er mandag - .

Yderligere: Administrer variabler direkte i flows!

Bare skriv et variabelnavn inden for enhver hvornår- og såkort og vælg det fra listen: variablen vil blive oprettet automatisk.
Hvis du vil bruge tagget, skal du gemme det først.
Variabler, der blev oprettet automatisk fra inden for flows, vil også blive automatisk slettet, når de ikke længere bruges i flowkort.
Variabler kan også stadig administreres fra indstillingsskærmen. Disse variabler vil ikke blive slettet automatisk, hvis de ikke bruges, men skal slettes manuelt.

Og Slet Alle-knappen har nu en bekræftelse!

* Funktion: Tilføjet API-support til at GET, GET alle variabler og SET (post) en værdi.
  * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
  * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Få alle variabler)
  * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Vær sikker på, at værdien matcher typen, ellers vil den ikke blive sat.
* Funktion: Udløs til API. Opkald
  * PUT for øget: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Dette udløser den givne variabel
* Funktion: Tilføj øge eller mindske til API. Opkald
  * PUT for øget: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Øger variablen med den givne værdi
  * PUT for mindske: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Mindsker variablen med den givne værdi
* Funktion: Tilføj skifte af boolean (true->false eller false->true) til API-support
  * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Dette vil tvinge til at vende boolean-værdien

* Funktion: Tilføj $timenow$ som en speciel variabel til mathjs. Dette vil hente den aktuelle tid i sekunder siden epoch. Denne variabel gemmes ikke i overblikket, men bruges i udtryk.
* Funktion: Tilføjet #DD (dag), #MM (måned), #YYYY (år), #HH (timer), #mm (minutter) #SS (sekunder) som reserverede ord ved siden af timenow i mathjs flows. Du kan nu for eksempel tildele #HH til en variabel for at få timerne. Jeg har også ændret timenow til #timenow for konsistens.