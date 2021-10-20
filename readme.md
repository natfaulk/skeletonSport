# Skeleton Sport
Originally created for Massey University's Engineering Experience Day. This is a basic game that uses pose detection to control on screen figures. The figures are drawn as stick figures and the aim is to kick a ball into a goal at either end of the screen. It is very basic and there is a lot that could be done to improve it.

## To run
The app runs as a desktop app using electron.  
[NodeJS](https://nodejs.org/en/) needs to be installed. At last update I was using v14.17
Download this repository `git clone https://github.com/natfaulk/skeletonSport`  
Install the dependencies (run from inside the skeletonsport folder) `npm install`  
Run the app `npm start`  

A few things to note:
- The screen size is not adaptive, so if the game is the wrong size, zoom it in `ctr shift =` or out `ctrl -`  
- Sometimes the dependencies don't work with updated versions of node. If that is the case, delete the `node_modules` folder, remove the electron and all the tensor flow dependencies from `package.json` and re-add each with `npm install --save THE_PACKAGE_NAME`. In the future I should fix this / or make it fully browser based like my [bird game](https://github.com/natfaulk/posebird)  
