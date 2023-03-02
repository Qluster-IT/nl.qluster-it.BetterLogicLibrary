*If you are a User and want to know more about how to use the new **BLL coding**, goto the* [[APP][Pro] Better Logic Library - For Users](https://community.homey.app/t/app-pro-better-logic-library-for-users/71876) Forum Topic.

*If you are a App Developer and want to know more about how to include this into your App or how to let your App support BLL coding, goto the* [[APP][Pro] Better Logic Library - For Developers](https://community.homey.app/t/app-pro-better-logic-library-for-developers/71761) Forum Topic.

Part of: [Better Logic Library - Just some better logic, variable and library management](https://community.homey.app/t/app-pro-better-logic-just-some-better-logic-and-variable-management/5568)


## Homey's first real Library: Better Logic Library!

The [Better Logic](https://homey.app/a/net.i-dev.betterlogic/) App has a new addition: Libraries and a library management for other apps to consume.

# The new Decoder
BLL now has new expression cards, but also a new coding for text arguments within flowcards.
For instance, when you place this within a textargument: ```Hello, today is {[date("dddd")]}```, BLL will automaticly find those expressions within the texts and decode them, resulting in - Hello, today is monday - .

Users currently have access to lodash, mathjs, basic javascript methods and customisable methods through the BLL App Settings.
But also the custom **DateTime** and **Number** module.
A user can for instance use this within the Save Image Token flowcard from the [FTP Client App](https://homey.app/a/nl.qluster-it.FtpClient/).
![image|325x88](https://global.discourse-cdn.com/business4/uploads/athom/original/3X/c/b/cbdf7a46238eb6597776874ea66ce83adf3b2e2f.png)
This image will be saved with the custom timestamp the user writes himself.

Users can also add there own custom functions within the Better Logic App Settings, which they then can use in all Apps, yours too!


### NPM modules can be loaded from BLL, which reduces the installation time and size of your App.
Currenty you can load the next NPM's
* **math.js** 11.3.3
* **lodash** 4.17.21.

## Basis for your settings
Currently you can reference to the next files in Settings or (Re)Pair screens:
* **Bootstrap** 5.2.2
  ../net.i-dev.betterlogic/assets/css/bootstrap.min.css
  ../net.i-dev.betterlogic/assets/js/bootstrap.bundle.min.js
* **Font Awesome** (Solid and Regular) 6.2.0
  ../net.i-dev.betterlogic/assets/css/fontawesome.min.css
  ../net.i-dev.betterlogic/assets/js/fontawesome.min.js
* **jQuery UI**
  ../net.i-dev.betterlogic/assets/js/jquery-ui.min.js
  ../net.i-dev.betterlogic/assets/css/jquery-ui.css
  * **jQuery UI Touch-Punch**, include this for 'clicks" on mobiles, adjusted for Homey.
  ../net.i-dev.betterlogic/assets/js/jquery-ui.touch-punch.min.js
* **Lodash** 4.17.21.
  ../net.i-dev.betterlogic/assets/js/lodash.min.js
* **AngularJS** 1.8.2
  ../net.i-dev.betterlogic/assets/js/angular.min.js
  * **Drag-and-drop** 1.0.3 angularjs (Customized for Homey )
  ../net.i-dev.betterlogic/assets/js/angular-dragdrop.js
  * **Smart Table** angularjs
  ../net.i-dev.betterlogic/assets/js/smart-table.min.js
  ../net.i-dev.betterlogic/assets/css/smart-table.css

# How to include into your App?

## The Basic

These are just a few simple steps to start with the most basic: include the BLL and initialize it:
* Add BLL through NPM.
`npm install betterlogiclibrary`
* Add the permission to your app.json
```"permissions": ["homey:app:net.i-dev.betterlogic"]```
* Import the BL module in the app.js:.
```const { BL } = require('betterlogiclibrary');```
* Initialize the BL in the app.js onInit:
````await BL.init({homey:this.homey});````



**There will be no error's thrown if BLL is not installed or not available**, if no modules are used, it is put on silent mode.
Making it not required, but a bonus for users who wish to use BLL coding: If your app supports it, they just need to install BLL (which they already will have i guess).

## Decoder
Now, to use the decoder, you do not need any modules loaded. The texts will be decoded by the BLL App, so **you do not need to include math.js or lodash into your app to support decoding**.

All you need to do, is run the text you wish to decode through the decoder:
* Import the BL module.
```const { BL } = require('betterlogiclibrary');```
* Use it! Here is an path argument that i want to have decoded:
```args.path = await BL.decode(args.path);```

# That's it!



## Including modules
To include modules like lodash, follow these steps:
* Include the module(s) in the BL initialization:
```
let bl = await new BL({
  homey:this.homey, 
  modules:[
    "_",
    "math",
    "datetime"
]});
```
* Now you can use it anywhere:
```BL._.find```
```BL._.pickBy```
```BL.datetime.toString('dd-MM-yyyy')``` 
```BL.datetime.toString('dddd')``` = monday

## How does it work?
The BLL loader loads modules through the BLL Api. This massively reduces the app install size.
Only requested modules are loaded and the Static BL is generated.
Every time the BLL get's an update or is installed, all updated files and modules will be reloaded into your app. **Your app doesn't even need a restart for this!**