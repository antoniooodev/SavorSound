#!/bin/bash
cd ./Iris

npm run build:mopidy

cd ..

poetry run mopidy --config ./mopidy.conf
