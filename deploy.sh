#!/bin/bash

# init 
APP_PATH=${PWD}
FORCE_INSTALL=false
if [ ! -z "$1" ]; then
	FORCE_INSTALL=true
fi

echo "application path is ${APP_PATH}"

# functions
function installModuleIfMissing(){
	# check parameters
	if [ -z "$1" ]; then
		echo "Please provide a module to install."
		exit -1
	fi
	MODULE=$1
	ARGS=""
	if [ ! -z "$2" ]; then
		ARGS=$2
	fi
	
	# run installation
	echo " "
	echo "checking npm module $MODULE"
	MODULE_PATH=${APP_PATH}/node_modules/${MODULE}
	if [ ! -d $MODULE_PATH ] || [ $FORCE_INSTALL = true ]; then
		if [ $FORCE_INSTALL = true ]; then
			echo "Forcing reinstall of $MODULE"
		else
			echo "The folder $MODULE_PATH does not exist. Installing module $MODULE."
		fi
		npm install $MODULE $ARGS
	else
		echo "Module $MODULE is already installed."
	fi
	echo " "
}

# install node dependencies
installModuleIfMissing express
installModuleIfMissing bower
installModuleIfMissing request
installModuleIfMissing body-parser
installModuleIfMissing mongojs

# bower
bower install --allow-root

# install forever to keep server up
installModuleIfMissing forever -g
forever stopall
read -p "Installed everything. Press [Enter] to start node server"
forever start server.js
