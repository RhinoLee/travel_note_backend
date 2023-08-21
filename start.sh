#!/bin/bash

export NODE_ENV=production

./wait-for.sh mysql:3306 --timeout=30

npm run migrate up
if [ $? -ne 0 ]; then
  echo "Migration failed!"
  exit 1
fi

node ./main.js