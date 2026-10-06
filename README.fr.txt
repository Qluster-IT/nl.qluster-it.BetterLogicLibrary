Bienvenue dans la Bibliothèque Better Logic.

Une bibliothèque de logique avancée avec gestion des variables et des bibliothèques pour Homey.

Cette application fournit à votre Homey une meilleure logique et des bibliothèques :
* Gestion des variables de manière intelligente et intégrée.
* Cartes d'action et de condition avancées avec Better Logic, comme Math.js.
* Appareils pour gérer directement les variables.
* Formatage de date et heure, entièrement personnalisable, partagé avec d'autres applications.
* Codage BLL et expressions BLL à utiliser directement dans les cartes de flux d'autres applications.
* Fonctions personnalisées à utiliser dans le codage BLL et les expressions BLL.
* Bibliothèques à utiliser dans le codage BLL et les expressions BLL, comme Math.js et Lodash.
* Un serveur de fichiers qui peut être consommé par d'autres applications, comme Simple (Sys) LOG, pour servir des fichiers sur votre LAN ou les télécharger sur l'application mobile Homey ou les outils de développement.
* Bibliothèques à consommer pour d'autres applications, réduisant les tailles d'application et les redondances et améliorant la gestion.
* API pour la gestion des variables, utilisant le serveur de fichiers ou d'autres fonctions BLL.
* Cartes de flux pour convertir un objet/array JSON en CSV ou Excel.

Consultez les (nouveaux) paramètres de l'application pour toutes les fonctionnalités et explications, comme le codage BLL dans les applications prises en charge !

Exemple de codage BLL : Lorsque vous placez ceci dans un argument de texte : - Bonjour, aujourd'hui c'est {[date("dddd")]} -, BLL trouvera automatiquement ces expressions dans les textes et les décodera, résultant en - Bonjour, aujourd'hui c'est lundi -.

De plus : Gérez les variables directement dans les flux !

Il suffit de taper un nom de variable dans n'importe quelle carte de quand et puis et de la sélectionner dans la liste : la variable sera automatiquement créée.
Si vous souhaitez utiliser la balise, appuyez d'abord sur enregistrer.
Les variables créées automatiquement dans les flux seront également supprimées automatiquement lorsqu'elles ne sont plus utilisées dans les cartes de flux.
Les variables peuvent également être gérées à partir de l'écran des paramètres. Ces variables ne seront pas automatiquement supprimées si elles ne sont pas utilisées, mais doivent être supprimées manuellement.

Fonctionnalité : Ajoutez $timenow$ comme une variable spéciale pour mathjs. Cela récupérera l'heure actuelle en secondes depuis l'époque. Cette variable n'est pas stockée dans l'aperçu, mais utilisée dans les expressions.
Fonctionnalité : Ajout de #DD (jour), #MM (mois), #YYYY (année), #HH (heures), #mm (minutes) #SS (secondes) comme mots réservés à côté de timenow dans les flux mathjs. Vous pouvez maintenant par exemple assigner #HH à une variable pour obtenir les heures. J'ai aussi changé timenow en #timenow pour plus de cohérence.

Voir le forum communautaire pour plus d'informations !