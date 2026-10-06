Welcome to the Better Logic Library.

An advanced logic library with variable and library management for Homey.

This apps supplies your Homey with Better Logic and Libraries:
* Variable management in a smart, integrated way.
* Advanced action- and conditioncards with Better Logic, like Math.js.
* Devices to directly manage the variables.
* Datetime formatting, fully customisable, shared with other apps.
* BLL coding and BLL expressions to use directly within other apps flowcards.
* Custom functions to use within BLL coding and BLL expressions.
* Libraries to use within BLL coding and BLL expressions, like Math.js and Lodash.
* A File Server that can be consumed by other apps, like Simple (Sys) LOG, to serve files on you LAN or to download them on the Homey Mobile App or the Developertools.
* Libraries for other Apps to consume, reducing app sizes and redundancies and improving management.
* APIs for variable management, using the File Server or other BLL functions.
* Flow cards to convert a JSON object/array into CSV or Excel.

Check out the (new) App Settings for all features and explanations, like BLL coding in supported apps!

Example BLL coding: When you place this within a textargument:  - Hello, today is {[date("dddd")]} -, BLL will automaticly find those expressions within the texts and decode them, resulting in - Hello, today is monday - .

Further: Manage variables directly in flows!

Just type a variable name within any when- and thencard and select it from the list: the variable will be automaticly created.
If you want to use the tag, press save first.
Variables that were automaticly created from within flows will also be automaticly deleted when they are no longer used in flowcards.
Variables can also still be managed from the settings screen. These variables will not be automaticly deleted if not used, but must be manually deleted.

Feature: Add $timenow$ as a special variable for mathjs. This will retrieve the current time in seconds since epoch This variable is not stored in the overview, but used in expressions.
Feature: Added #DD (day), #MM (month), #YYYY (year), #HH (hours), #mm (minutes) #SS (seconds) as reserved words next to timenow in the mathjs flows. You can now for example assign #HH to a variable to get the hours. Also I changed timenow to #timenow for consistency.


See the community forum for more information!