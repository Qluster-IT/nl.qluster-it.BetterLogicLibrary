Willkommen in der Better Logic Library.

Eine fortschrittliche Logikbibliothek mit Variablen- und Bibliotheksverwaltung für Homey.

Diese App versorgt dein Homey mit Better Logic und Bibliotheken:
* Variablenmanagement auf intelligente, integrierte Weise.
* Erweiterte Aktions- und Bedingungskarten mit Better Logic, wie Math.js.
* Geräte zur direkten Verwaltung der Variablen.
* Datumsformatierung, vollständig anpassbar, geteilt mit anderen Apps.
* BLL-Codierung und BLL-Ausdrücke zur direkten Nutzung in anderen App-Flowkarten.
* Benutzerdefinierte Funktionen zur Verwendung in BLL-Codierung und BLL-Ausdrücken.
* Bibliotheken zur Nutzung in BLL-Codierung und BLL-Ausdrücken, wie Math.js und Lodash.
* Ein File-Server, der von anderen Apps genutzt werden kann, wie Simple (Sys) LOG, um Dateien auf deinem LAN bereitzustellen oder sie auf die Homey Mobile App oder die Entwicklertools herunterzuladen.
* Bibliotheken, die von anderen Apps genutzt werden können, um App-Größen zu reduzieren, Redundanzen zu minimieren und die Verwaltung zu verbessern.
* APIs für das Variablenmanagement, unter Nutzung des File Servers oder anderer BLL-Funktionen.
* Flowcards, um ein JSON-Objekt/Array in CSV oder Excel zu konvertieren.

Schau dir die (neuen) App-Einstellungen für alle Funktionen und Erklärungen an, wie BLL-Codierung in unterstützten Apps!

Beispiel für BLL-Codierung: Wenn du dies in einem Textargument platzierst: - Hallo, heute ist {[date("dddd")]} -, wird BLL automatisch diese Ausdrücke im Text finden und dekodieren, was zu - Hallo, heute ist Montag - führt.

Außerdem: Verwalte Variablen direkt in Flows!

Gib einfach einen Variablennamen in einer beliebigen Wenn- und Dann-Karte ein und wähle ihn aus der Liste aus: Die Variable wird automatisch erstellt.
Wenn du das Tag verwenden möchtest, speichere es zuerst.
Variablen, die automatisch aus Flows erstellt wurden, werden ebenfalls automatisch gelöscht, wenn sie in Flowkarten nicht mehr verwendet werden.
Variablen können weiterhin über den Einstellungsbildschirm verwaltet werden. Diese Variablen werden nicht automatisch gelöscht, wenn sie nicht verwendet werden, sondern müssen manuell gelöscht werden.

Funktion: Füge $timenow$ als spezielle Variable für mathjs hinzu. Dies ruft die aktuelle Zeit in Sekunden seit dem Epoch ab. Diese Variable wird nicht in der Übersicht gespeichert, sondern in Ausdrücken verwendet.
Funktion: Hinzugefügt #DD (Tag), #MM (Monat), #YYYY (Jahr), #HH (Stunden), #mm (Minuten), #SS (Sekunden) als reservierte Wörter neben timenow in den mathjs-Flows. Du kannst nun zum Beispiel #HH einer Variablen zuweisen, um die Stunden zu erhalten. Auch habe ich timenow in #timenow für Konsistenz geändert.

Sieh dir das Community-Forum für weitere Informationen an!