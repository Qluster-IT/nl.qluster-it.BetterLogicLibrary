Benvenuto nella Better Logic Library.

Una libreria logica avanzata con gestione di variabili e librerie per Homey.

Questa app fornisce al tuo Homey una logica migliore e librerie:
* Gestione delle variabili in modo intelligente e integrato.
* Schede di azioni e condizioni avanzate con Better Logic, come Math.js.
* Dispositivi per gestire direttamente le variabili.
* Formattazione della data e dell’ora, completamente personalizzabile, condivisa con altre app.
* Codifica BLL ed espressioni BLL da usare direttamente all’interno delle schede di flusso di altre app.
* Funzioni personalizzate da usare nella codifica BLL e nelle espressioni BLL.
* Librerie da usare nella codifica BLL e nelle espressioni BLL, come Math.js e Lodash.
* Un server di file che può essere consumato da altre app, come Simple (Sys) LOG, per servire file sulla tua LAN o per scaricarli sull’app Homey Mobile o sugli strumenti di sviluppo.
* Librerie per altre app da consumare, riducendo le dimensioni delle app e le ridondanze e migliorando la gestione.
* API per la gestione delle variabili, utilizzando il server di file o altre funzioni BLL.
* Schede di flusso per convertire un oggetto/array JSON in CSV o Excel.

Controlla le (nuove) impostazioni dell'app per tutte le funzionalità e spiegazioni, come la codifica BLL nelle app supportate!

Esempio di codifica BLL: quando inserisci questo in un argomento testo: - Ciao, oggi è {[date("dddd")]} -, BLL troverà automaticamente quelle espressioni nei testi e le decodificherà, risultando in - Ciao, oggi è lunedì -.

Altro: gestisci le variabili direttamente nei flussi!

Basta digitare un nome di variabile in qualsiasi scheda when e then e selezionarlo dall'elenco: la variabile verrà creata automaticamente. Se vuoi usare il tag, premi prima salva. Le variabili create automaticamente all'interno dei flussi verranno anche eliminate automaticamente quando non vengono più usate nelle schede di flusso. Le variabili possono essere ancora gestite dalla schermata delle impostazioni. Queste variabili non verranno eliminate automaticamente se non usate, ma devono essere eliminate manualmente.

Funzionalità: aggiungi $timenow$ come variabile speciale per mathjs. Questo recupererà l'ora corrente in secondi dall'epoch. Questa variabile non è memorizzata nella panoramica, ma utilizzata nelle espressioni.
Funzionalità: aggiunti #DD (giorno), #MM (mese), #YYYY (anno), #HH (ore), #mm (minuti) #SS (secondi) come parole riservate accanto a timenow nei flussi mathjs. Ora puoi, per esempio, assegnare #HH a una variabile per ottenere le ore. Ho anche cambiato timenow in #timenow per coerenza.

Consulta il forum della community per ulteriori informazioni!