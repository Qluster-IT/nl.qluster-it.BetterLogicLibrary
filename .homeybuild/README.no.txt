Velkommen til Better Logic Library.

Et avansert logikkbibliotek med variabel- og bibliotekadministrasjon for Homey.

Denne appen gir Homey forbedret logikk og biblioteker:
* Variabelhåndtering på en smart, integrert måte.
* Avanserte handlings- og betingelseskort med Better Logic, som Math.js.
* Enheter for å administrere variablene direkte.
* Datotidsformatering, fullstendig tilpassbar, delt med andre apper.
* BLL-koding og BLL-uttrykk som kan brukes direkte i andre apps flytkort.
* Tilpassede funksjoner for bruk i BLL-koding og BLL-uttrykk.
* Biblioteker for bruk i BLL-koding og BLL-uttrykk, som Math.js og Lodash.
* En filserver som kan brukes av andre apper, som Simple (Sys) LOG, for å levere filer på ditt LAN eller laste dem ned på Homey Mobile App eller utviklerverktøyene.
* Biblioteker for andre apper å bruke, reduserer appstørrelser og redundanser og forbedrer administrasjonen.
* API-er for variabelhåndtering, ved bruk av filserveren eller andre BLL-funksjoner.

Sjekk ut de (nye) appinnstillingene for alle funksjoner og forklaringer, som BLL-koding i støttede apper!

Eksempel på BLL-koding: Når du plasserer dette innenfor et tekstargument: - Hei, i dag er {[date("dddd")]} -, vil BLL automatisk finne disse uttrykkene innenfor tekstene og dekode dem, noe som resulterer i - Hei, i dag er mandag - .

Videre: Administrer variabler direkte i flyt!

Bare skriv inn et variabelnavn i en når- eller da-kort og velg det fra listen: variabelen vil automatisk opprettes.
Hvis du vil bruke taggen, trykk lagre først.
Variabler som ble automatisk opprettet fra flyt vil også automatisk slettes når de ikke lenger brukes i flytkort.
Variabler kan fortsatt administreres fra innstillingsskjermen. Disse variablene vil ikke automatisk slettes hvis de ikke brukes, men må slettes manuelt.

Og slett alle-knappen har nå en bekreftelse!

* Funksjon: Lagt til API-støtte for å HENTE, HENTE alle variabler og SETT (post) en verdi.
   * HENT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
   * HENT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Hent alle variabler)
   * PUTT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Vennligst forsikre deg om at verdien samsvarer med typen, ellers vil den ikke settes.
* Funksjon: Trigger til API. Ring
   * PUTT for økning: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Dette aktiverer den gitte variabelen
* Funksjon: Legge til økning eller reduksjon til API. Ring
   * PUTT for økning: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Øker variabelen med den gitte verdien
   * PUTT for reduksjon: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Reduserer variabelen med den gitte verdien
* Funksjon: Legge til veksling av boolsk (sant->usant eller usant->sant) til API-støtte
   * PUTT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Dette vil tvinge til å snu den boolske verdien

* Funksjon: Legg til $timenow$ som en spesiell variabel for mathjs. Dette vil hente gjeldende tid i sekunder siden epoken. Denne variabelen er ikke lagret i oversikten, men brukes i uttrykkene.
* Funksjon: Lagt til #DD (dag), #MM (måned), #YYYY (år), #HH (timer), #mm (minutter) #SS (sekunder) som reserverte ord ved siden av timenow i mathjs-flyt. Du kan nå for eksempel tildele #HH til en variabel for å få timene. Jeg har også endret timenow til #timenow for konsistens.