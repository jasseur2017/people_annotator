#!/bin/bash

npm install
# npm run build

# npm i -g npm-check-updates
# ncu -u
# npm install

exec docker-entrypoint.sh "$@"
