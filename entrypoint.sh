#!/bin/sh
set -euo pipefail

npx prisma migrate deploy

exec node server.js
