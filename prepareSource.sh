#!/bin/sh
cd lambdas
npm install
rm -rf function.zip
zip -r function.zip .
cd -
