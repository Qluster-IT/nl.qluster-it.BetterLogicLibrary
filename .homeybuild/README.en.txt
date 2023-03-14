Welcome to the Better Logic Library.

An advanced logic library with variable and library management for Homey.

This apps supplies your Homey with Better Logic and Libraries:
* Variable management in a smart, integrated way.
* Advanced action- and conditioncards with Better Logic, like Math.js.
* Devices to directly manage the variables.
* Datetime formatting, fully customisable, shared with other apps.
* BLL coding and BLL expressions to use directly within other apps flowcards.
* Customisable functions to use within BLL coding and BLL expressions.
* Libraries to use within BLL coding and BLL expressions, like Math.js and Lodash.
* A File Server that can be consumed by other apps, like the Simple (Sys) LOG, to serve files on you LAN or to download them on the Homey Mobile App or the Developertools.
* Libraries for other Apps to consume, reducing app sizes and redundancies and improving management.
* APIs for variable management, using the File Server or other BLL functions.
* Flowcards to convert any JSON object/array into CSV or Excel.

Check out the (new) App Settings for all features and explanations, like BLL coding in supported apps!

Example BLL coding: When you place this within a textargument:  - Hello, today is {[date("dddd")]} -, BLL will automaticly find those expressions within the texts and decode them, resulting in - Hello, today is monday - .

Further: Manage variables directly in flows!

Just type a variable name within any when- and thencard and select it from the list: the variable will be automaticly created.
If you want to use the tag, press save first.
Variables that were automaticly created from within flows will also be automaticly deleted when they are no longer used in flowcards.
Variables can also still be managed from the settings screen. These variables will not be automaticly deleted if not used, but must be manually deleted.

And the Delete All button has a confirm now!


* Feature: Added API support to GET, GET all variables and SET (post) a value.
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
	* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (Get all variables)
	* PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //Please ensure that the value matches the type, otherwise it will not be set.
* Feature: Trigger to API. Call
	* PUT for increment: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME This triggers the given variable
* Feature: Add increment or decrement to API. Call
	* PUT for increment: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  Increments the variable with the given value
	* PUT for decrement: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  Decrements the variable with the given value
* Feature: Add toggle of boolean (true->false or false->true) to API support
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle This will force to flip the boolean value

* Feature: Add $timenow$ as a special variable for mathjs. This will retrieve the current time in seconds since epoch This variable is not stored in the overview, but used in expressions.
* Feature: Added #DD (day), #MM (month), #YYYY (year), #HH (hours), #mm (minutes) #SS (seconds) as reserved words next to timenow in the mathjs flows. You can now for example assign #HH to a variable to get the hours. Also I changed timenow to #timenow for consistency.
