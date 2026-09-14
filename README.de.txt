Willkommen in der Better Logic Bibliothek.

Eine erweiterte Logikbibliothek mit Variablen- und Bibliotheksverwaltung für Homey.

Diese App bietet deinem Homey Better Logic und Bibliotheken:
* Variablenverwaltung auf smarte, integrierte Weise.
* Erweiterte Aktions- und Bedingungskarten mit Better Logic, wie Math.js.
* Geräte zur direkten Verwaltung der Variablen.
* Datums- und Zeitformatierung, vollständig anpassbar, gemeinsam mit anderen Apps genutzt.
* BLL-Codierung und BLL-Ausdrücke zur direkten Nutzung in Flowkarten anderer Apps.
* Benutzerdefinierte Funktionen zur Verwendung in BLL-Codierungen und BLL-Ausdrücken.
* Bibliotheken zur Nutzung in BLL-Codierungen und BLL-Ausdrücken, wie Math.js und Lodash.
* Ein Dateiserver, der von anderen Apps genutzt werden kann, wie Simple (Sys) LOG, um Dateien in deinem LAN bereitzustellen oder auf der Homey Mobile App oder den Entwicklertools herunterzuladen.
* Bibliotheken, die von anderen Apps genutzt werden können, um App-Größen und Redundanzen zu reduzieren und das Management zu verbessern.
* APIs für die Variablenverwaltung, Nutzung des Dateiservers oder anderer BLL-Funktionen.

Schau dir die (neuen) App-Einstellungen für alle Funktionen und Erklärungen an, z.B. BLL-Codierung in unterstützten Apps!

Beispiel BLL-Codierung: Wenn du dies in ein Textargument einfügst: - Hallo, heute ist {[date("dddd")]} -, wird BLL diese Ausdrücke automatisch im Text finden und dekodieren, was zu - Hallo, heute ist Montag - führt.

Weiter: Verwalte Variablen direkt in Flows!

Gib einfach einen Variablennamen in einer Wenn- oder Dann-Karte ein und wähle ihn aus der Liste aus: die Variable wird automatisch erstellt.
Wenn du das Tag verwenden möchtest, drücke zuerst speichern.
Variablen, die automatisch innerhalb von Flows erstellt wurden, werden auch automatisch gelöscht, wenn sie nicht mehr in Flowkarten verwendet werden.
Variablen können auch weiterhin über den Einstellungsbildschirm verwaltet werden. Diese Variablen werden nicht automatisch gelöscht, wenn sie nicht verwendet werden, sondern müssen manuell gelöscht werden.

Und der Alle Löschen-Button hat jetzt eine Bestätigung!

* Funktion: API-Unterstützung hinzugefügt, um GET, alle Variablen GET und SET (post) einen Wert zu verwenden.
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Alle Variablen abrufen)
	* PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Bitte stelle sicher, dass der Wert dem Typ entspricht, sonst wird er nicht gesetzt.
* Funktion: Auslöser zur API. Anruf
	* PUT für Inkrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Dies löst die gegebene Variable aus
* Funktion: Hinzufügen von Inkrement oder Dekrement zur API. Anruf
	* PUT für Inkrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Erhöht die Variable um den gegebenen Wert
	* PUT für Dekrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Verringert die Variable um den gegebenen Wert
* Funktion: Hinzufügen des umschaltbaren Booleschen (true->false oder false->true) zur API-Unterstützung
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Dies zwingt das Umschalten des booleschen Werts

* Funktion: $timenow$ als spezielle Variable für mathjs hinzufügen. Dies liefert die aktuelle Zeit in Sekunden seit Epoch. Diese Variable wird nicht im Überblick gespeichert, sondern in Ausdrücken verwendet.
* Funktion: Hinzufügen von #DD (Tag), #MM (Monat), #YYYY (Jahr), #HH (Stunden), #mm (Minuten) #SS (Sekunden) als reservierte Wörter neben timenow in den mathjs-Flows. Du kannst jetzt beispielsweise #HH einer Variable zuweisen, um die Stunden zu erhalten. Außerdem habe ich timenow in #timenow umgeändert, um Konsistenz zu gewährleisten.