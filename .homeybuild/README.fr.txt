Bienvenue dans la Bibliothèque Better Logic.

Une bibliothèque logique avancée avec gestion de variables et de bibliothèques pour Homey.

Cette application fournit à votre Homey Better Logic et Bibliothèques :
* Gestion des variables de manière intelligente et intégrée.
* Cartes d'action et de condition avancées avec Better Logic, comme Math.js.
* Appareils pour gérer directement les variables.
* Formatage de la date et de l'heure, entièrement personnalisable, partagé avec d'autres applications.
* Codage BLL et expressions BLL à utiliser directement dans d'autres applications par le biais de flowcards.
* Fonctions personnalisées à utiliser dans le codage BLL et les expressions BLL.
* Bibliothèques à utiliser dans le codage BLL et les expressions BLL, comme Math.js et Lodash.
* Un serveur de fichiers qui peut être consommé par d'autres applications, comme Simple (Sys) LOG, pour servir des fichiers sur votre réseau local ou les télécharger sur l'application mobile Homey ou les outils de développement.
* Bibliothèques que d'autres applications peuvent utiliser, réduisant la taille des applications et les redondances tout en améliorant la gestion.
* APIs pour la gestion des variables, utilisant le serveur de fichiers ou d'autres fonctions BLL.

Découvrez les (nouveaux) Paramètres de l'application pour toutes les fonctionnalités et explications, comme le codage BLL dans les applications prises en charge !

Exemple de codage BLL : Lorsque vous placez ceci dans un argument de texte : - Bonjour, aujourd'hui nous sommes {[date("dddd")]} -, BLL trouvera automatiquement ces expressions dans les textes et les décodera, donnant - Bonjour, aujourd'hui nous sommes lundi -.

En outre : Gérez les variables directement dans les flux !

Tapez simplement un nom de variable dans une carte quand-et alors et sélectionnez-le dans la liste : la variable sera automatiquement créée.
Si vous souhaitez utiliser le tag, appuyez d'abord sur enregistrer.
Les variables créées automatiquement dans les flux seront également supprimées automatiquement lorsqu'elles ne sont plus utilisées dans les cartes de flux.
Les variables peuvent également être gérées à partir de l'écran des paramètres. Ces variables ne seront pas supprimées automatiquement si elles ne sont pas utilisées, mais doivent être supprimées manuellement.

Et le bouton Supprimer Tout a maintenant une confirmation !


* Fonctionnalité : Ajout du support API pour GET, obtenir toutes les variables et SET (poster) une valeur.
	* GET : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMDUVARIABLE
	* GET : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Obtenir toutes les variables)
	* PUT : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMDUVARIABLE/VALEUR  //Veuillez vous assurer que la valeur correspond au type, sinon elle ne sera pas définie.
* Fonctionnalité : Déclencheur pour API. Appel
	* PUT pour incrément : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/NOMDUVARIABLE Cela déclenche la variable donnée
* Fonctionnalité : Ajouter incrément ou décrément à l'API. Appel
	* PUT pour incrément : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMDUVARIABLE/i/VALEUR  Augmente la variable de la valeur donnée
	* PUT pour décrément : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMDUVARIABLE/d/VALEUR  Diminue la variable de la valeur donnée
* Fonctionnalité : Ajouter le basculement de booléen (vrai->faux ou faux->vrai) au support API
    * PUT : HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/NOMDUVARIABLE/toggle Cela forcera le retournement de la valeur booléenne

* Fonctionnalité : Ajouter $timenow$ comme variable spéciale pour mathjs. Cela récupérera l'heure actuelle en secondes depuis l'époque. Cette variable n'est pas stockée dans l'aperçu, mais utilisée dans les expressions.
* Fonctionnalité : Ajout des mots réservés #DD (jour), #MM (mois), #YYYY (année), #HH (heures), #mm (minutes) #SS (secondes) à côté de timenow dans les flux mathjs. Vous pouvez maintenant par exemple assigner #HH à une variable pour obtenir les heures. J'ai également changé timenow en #timenow pour cohérence.