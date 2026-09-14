Välkommen till Better Logic Library.

Ett avancerat logikbibliotek med variabel- och biblioteksförvaltning för Homey.

Denna app ger din Homey Better Logic och Libraries:
* Variabelhantering på ett smart, integrerat sätt.
* Avancerade åtgärds- och villkorskort med Better Logic, som Math.js.
* Enheter för att direkt hantera variablerna.
* Datum- och tidsformatering, fullt anpassningsbar, delad med andra appar.
* BLL-kodning och BLL-uttryck för att använda direkt inom andra appar.
* Anpassade funktioner att använda inom BLL-kodning och BLL-uttryck.
* Bibliotek att använda inom BLL-kodning och BLL-uttryck, som Math.js och Lodash.
* En filserver som kan användas av andra appar, som Simple (Sys) LOG, för att servera filer på ditt LAN eller ladda ner dem på Homey Mobile-appen eller Developertools.
* Bibliotek för andra appar att använda, vilket minskar appstorlekar och redundans samt förbättrar hanteringen.
* API:er för variabelhantering, med hjälp av filservern eller andra BLL-funktioner.

Kolla in de (nya) appinställningarna för alla funktioner och förklaringar, som BLL-kodning i stödda appar!

Exempel på BLL-kodning: När du placerar detta inom ett textargument: - Hej, idag är {[date("dddd")]} -, hittar BLL automatiskt dessa uttryck inom texterna och avkodar dem, vilket resulterar i - Hej, idag är måndag -.

Dessutom: Hantera variabler direkt i flöden!

Skriv bara ett variabelnamn inom vilket då- och sen-kort som helst och välj det från listan: variabeln skapas automatiskt.
Om du vill använda taggen, tryck på spara först.
Variabler som automatiskt skapades inom flöden kommer också att automatiskt tas bort när de inte längre används i flödeskorten.
Variabler kan fortfarande hanteras från inställningsskärmen. Dessa variabler kommer inte automatiskt tas bort om de inte används, utan måste manuellt tas bort.

Och knappen Radera alla har nu en bekräftelse!

* Funktion: Lade till API-stöd för att HÄMTA, HÄMTA alla variabler och SÄTTA (posta) ett värde.
	* HÄMTA: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
	* HÄMTA: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Hämta alla variabler)
	* LÄGG IN: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Se till att värdet stämmer med typen, annars kommer det inte sättas.
* Funktion: Utlösare till API-anrop.
	* LÄGG IN för inkrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Detta utlöser den givna variabeln
* Funktion: Lägg till inkrement eller dekrementer till API-anrop.
	* LÄGG IN för inkrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Inkrementerar variabeln med det angivna värdet.
	* LÄGG IN för dekrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Dekrementerar variabeln med det angivna värdet.
* Funktion: Lägg till toggle av boolean (sant->falskt eller falskt->sant) till API-stöd
    * LÄGG IN: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Detta kommer tvinga till att ändra det booleanska värdet.

* Funktion: Lägg till $timenow$ som en speciell variabel för mathjs. Detta hämtar den aktuella tiden i sekunder sedan epok. Denna variabel lagras inte i översikten, utan används i uttryck.
* Funktion: Lade till #DD (dag), #MM (månad), #YYYY (år), #HH (timmar), #mm (minuter) #SS (sekunder) som reserverade ord bredvid timenow i mathjs-flödena. Du kan nu till exempel tilldela #HH till en variabel för att få timmarna. Jag ändrade också timenow till #timenow för konsekvensens skull.