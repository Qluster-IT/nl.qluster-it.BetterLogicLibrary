Benvenuto nella Better Logic Library.

Una libreria logica avanzata con gestione di variabili e libreria per Homey.

Questa app fornisce a Homey Better Logic e Librerie:
* Gestione delle variabili in un modo smart e integrato.
* Schede azione e condizione avanzate con Better Logic, come Math.js.
* Dispositivi per gestire direttamente le variabili.
* Formattazione data e ora, completamente personalizzabile e condivisa con altre app.
* Codifica BLL ed espressioni BLL da usare direttamente all'interno delle flowcard di altre app.
* Funzioni personalizzate da usare all'interno della codifica BLL e nelle espressioni BLL.
* Librerie da utilizzare nella codifica BLL e nelle espressioni BLL, come Math.js e Lodash.
* Un File Server che può essere utilizzato da altre app, come Simple (Sys) LOG, per servire file sulla tua LAN o per scaricarli sull'applicazione mobile Homey o sugli Strumenti di Sviluppo.
* Librerie da consumare per altre app, riducendo le dimensioni delle app e le ridondanze e migliorando la gestione.
* API per la gestione delle variabili, usando il File Server o altre funzioni BLL.

Dai un'occhiata alle (nuove) Impostazioni dell'App per tutte le funzionalità e spiegazioni, come la codifica BLL nelle app supportate!

Esempio di codifica BLL: Quando inserisci questo all'interno di un argomento testuale: - Ciao, oggi è {[date("dddd")]} -, BLL troverà automaticamente quelle espressioni nei testi e le decodificherà, risultando in - Ciao, oggi è lunedì -.

Inoltre: Gestisci le variabili direttamente nei flussi!

Basta digitare un nome di variabile in qualsiasi scheda when- o then- e selezionarlo dalla lista: la variabile verrà creata automaticamente. Se vuoi usare il tag, premi prima salva. Le variabili create automaticamente all'interno dei flussi verranno automaticamente eliminate quando non sono più utilizzate nelle flowcard. Le variabili possono ancora essere gestite dallo schermo delle impostazioni. Queste variabili non verranno eliminate automaticamente se non utilizzate, ma devono essere eliminate manualmente.

E ora il pulsante Elimina Tutto ha una conferma!

* Funzionalità: Aggiunto supporto API per GET, ottenere tutte le variabili e SET (post) un valore.
  * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMEVARIABILE
  * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Ottieni tutte le variabili)
  * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMEVARIABILE/VALORE // Assicurati che il valore corrisponda al tipo, altrimenti non verrà impostato.
* Funzionalità: Trigger all'API. Chiamata
  * PUT per incremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/NOMEVARIABILE Questo attiva la variabile data
* Funzionalità: Aggiungi incremento o decremento all'API. Chiamata
  * PUT per incremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMEVARIABILE/i/VALORE Incrementa la variabile con il valore dato
  * PUT per decremento: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMEVARIABILE/d/VALORE Decrementa la variabile con il valore dato
* Funzionalità: Aggiungi toggle di booleano (true->false o false->true) al supporto API
  * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMEVARIABILE/toggle Questo forzerà il ribaltamento del valore booleano

* Funzionalità: Aggiungi $timenow$ come variabile speciale per mathjs. Questo recupererà l'ora attuale in secondi dall'epoca. Questa variabile non viene memorizzata nell'anteprima, ma utilizzata nelle espressioni.
* Funzionalità: Aggiunti #DD (giorno), #MM (mese), #YYYY (anno), #HH (ore), #mm (minuti), #SS (secondi) come parole riservate accanto a timenow nei flussi mathjs. Ora puoi, ad esempio, assegnare #HH a una variabile per ottenere le ore. Inoltre ho cambiato timenow in #timenow per coerenza.