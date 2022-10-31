An advanced logic library with variable management for Homey.

New: Manage variables directly in flows!

Just type a variable name within any flowcard and select it from the list: the variable will be automaticly created.
If you want to use the tag, press save first.

Variables that were automaticly created from within flows will also be automaticly deleted when they are no longer used in flowcards.

Variables can still also be managed from the settings screen. These variables will not be automaticly deleted if not used, but must be manually deleted.

And the Delete All button has a confirm now!


* Feature: NumSlide device. When adding, first you have to specify the min, max and step size. After that you can select your number variable.
* Feature: Trigger variable with action cards. This trigger fires one time when being triggered
* Feature: Trigger device to create a button that can trigger
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
* Feature: Added NumSlide device for numeric value changes. It ranges from 0-100 with steps of 0.5
* Feature: Changed the i and d in increment to increment and decrement (left the i and d for backward compatibility)
* Feature: Added #DD (day), #MM (month), #YYYY (year), #HH (hours), #mm (minutes) #SS (seconds) as reserved words next to timenow in the mathjs flows. You can now for example assign #HH to a variable to get the hours. Also I changed timenow to #timenow for consistency.

* Feature: Add decimal support in the number action cards. This will work starting from Homey V0.10
* Feature: Turn on insights for boolean and number values. Existing variables will also be turned on
* Feature: Implement backup and restore of variables offline

* Feature: Add Mathjs.org action card. Only number output is supported. (Be aware, there is no syntax validation)
    * For supported features see http://mathjs.org/docs/expressions/syntax.html
	* An example could be $var1$ + 100. This is then assigned to the selected number value
* Feature: Add $timenow$ as a special variable for mathjs. This will retrieve the current time in seconds since epoch This variable is not stored in the overview, but used in expressions.
	* In the condition flow this can be used to test if a certain time is passed. $timenow$ > $storedTime$ + 1800 (half an hour)
    * In the action flow this can be used to create a time in the future by donig $timenow$ + 1800 (half an hour)
* Feature: Add card that triggers when a variable is set but is or is not changed
	* The last changed date/time in the grid overview is now changed to the last set date/time
* Feature: Add Mathjs.org condition card. Currently only boolean logic is supported. (Be aware, there is no syntax validation)
    * For supported features see http://mathjs.org/docs/expressions/syntax.html
	* An example could be $var1$ > 100 and $var1$ < 200 and $bool1$
* Feature: Add card that triggers on change of one of the specified variables (Be aware, there is no syntax validation)

* Feature: Add date time last changed to settings screen with format (YYYY-MM-DD HH-MM-SS)
* Feature: Implement insights. (note that bool and string values are not displayed yet in the module)
* Feature: Implement card that can set all variables. It converts the type. If the type matches the value is setted
* Feature: Implement trigger card that triggers on a number change. (minimal difference, minimal increase or minimal decrease)
