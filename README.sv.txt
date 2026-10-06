Välkommen till Better Logic-biblioteket.

Ett avancerat logikbibliotek med variabel- och biblioteksstyrning för Homey.

Den här appen ger din Homey Better Logic och bibliotek:
* Variabelhantering på ett smart, integrerat sätt.
* Avancerade åtgärds- och villkorskort med Better Logic, som Math.js.
* Enheter för att direkt hantera variabler.
* Datumsformattering, helt anpassningsbar, delad med andra appar.
* BLL-kodning och BLL-uttryck att använda direkt i andra apparflödeskort.
* Anpassade funktioner att använda inom BLL-kodning och BLL-uttryck.
* Bibliotek att använda inom BLL-kodning och BLL-uttryck, som Math.js och Lodash.
* En filserver som kan användas av andra appar, som Simple (Sys) LOG, för att tillhandahålla filer på ditt LAN eller för att ladda ner dem på Homey Mobile App eller utvecklingsverktygen.
* Bibliotek för andra appar att använda, vilket minskar appstorlekar och redundanser och förbättrar hanteringen.
* API:er för variabelhantering, med hjälp av filservern eller andra BLL-funktioner.
* Flödeskort för att konvertera ett JSON-objekt/array till CSV eller Excel.

Kolla in de (nya) App Inställningarna för alla funktioner och förklaringar, som BLL-kodning i stödda appar!

Exempel på BLL-kodning: När du placerar detta inom ett textargument: - Hej, idag är {[date("dddd")]} -, kommer BLL automatiskt att hitta dessa uttryck inom texterna och avkoda dem, vilket resulterar i - Hej, idag är måndag -.

Vidare: Hantera variabler direkt i flöden!

Skriv bara ett variabelnamn inom vilket när- och dåkort som helst och välj det från listan: variabeln kommer automatiskt att skapas.
Om du vill använda taggen, tryck först på spara.
Variabler som automatiskt skapades direkt i flöden kommer också automatiskt att tas bort när de inte längre används i flödeskort.
Variabler kan också fortfarande hanteras från inställningsskärmen. Dessa variabler kommer inte att tas bort automatiskt om de inte används, utan måste tas bort manuellt.

Funktion: Lägg till $timenow$ som en speciell variabel för mathjs. Detta hämtar aktuell tid i sekunder sedan epoch. Denna variabel sparas inte i översikten, men används i uttryck.
Funktion: Lade till #DD (dag), #MM (månad), #YYYY (år), #HH (timmar), #mm (minuter) #SS (sekunder) som reserverade ord bredvid timenow i mathjs-flöden. Du kan nu till exempel tilldela #HH till en variabel för att få timmarna. Jag ändrade även timenow till #timenow för konsekvensens skull.

Se gemenskapsforumet för mer information!