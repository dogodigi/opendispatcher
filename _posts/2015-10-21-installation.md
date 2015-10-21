---
layout: post
title: "Installation"
---

## Requirements

* [NodeJS & NPM](http://nodejs.org/download)
* Git

### Windows specifics
* [Python (version 2.7)] (https://www.python.org/download/releases/2.7.6/) Windows: add PYTHON system variable pointing to the full path to python.exe.
* [PostgreSQL (version 9.3)] (http://www.postgresql.org/download/) Windows: Add to the PATH system variable the /bin directory for PostgreSQL.
* Microsoft Visual Studio C++
* Restart Windows after altering system variables.

## Installation

From a console or terminal:

    git clone git@github.com:dogodigi/opendispatcher.git
    cd opendispatcher
    npm install .

*Note:* Check that `npm install .` doesn't generate errors. The installation
 process will tell you what components are missing (f.i. postgresql)

Create a file called config.json.

*Note:* you can copy `config.default.json` to `config.json` to get hints on the required variables.

To start the applicatie in "development mode":

    npm start

To start the application in "production mode":

    export NODE_ENV=production && npm start

Or, using forever:

    NODE_ENV=production /usr/bin/forever start -c "npm start" /path/to/opendispatcher/

Point your browser to [http://localhost:3000](http://localhost:3000) to check if the application is running.
