# safetymapsDBK

Digitale bereikbaarheidskaarten voor de Brandweer.

Gebruikt de volgende componenten:

Node.js, Express, Postgresql/Postgis, Jade, Fontawesome, jQuery, OpenLayers, moment.js en Bootstrap.

[Demo](http://demo.safetymaps.nl)

## Requirements
* [NodeJS & NPM](http://nodejs.org/download)
* Git, uiteraard
* [Python (versie 2.7)] (https://www.python.org/download/releases/2.7.6/) Windows: voeg aan de system variables PYTHON met als waarde de bestandsnaam python.exe (inclusief directory) toe.
* [PostgreSQL (versie 9.3)] (http://www.postgresql.org/download/) Windows: voeg aan de system variables PATH met als waarde de bin directory van PostgreSQL toe.
* Microsoft Visual Studio C++

Windows: na aanpassen system variables opnieuw opstarten.

## Installatie

Vanaf een terminal:

    git clone -b express-versie git@github.com:opengeogroep/safetymapsDBK.git
    cd safetymapsDBK
    npm install .
    
*Let op:* Controleer het npm install . proces op fouten. De installatie vertelt namelijk of je b.v. de postgresql client nog moet installeren

Maak een config.json bestand aan.

*Tip:* kopieer config.default.json naar config.json en vul de juiste waarden in.

start de applicatie in "development mode":

    node app.js

Ga met een browser naar [http://localhost:3000](http://localhost:3000) als het goed is is de applicatie nu gestart.
