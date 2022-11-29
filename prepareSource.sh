#!/bin/sh
cd lambdas
rm -rf function.zip
zip -r function.zip .
cd -