#!/bin/bash
set -e

echo "==> Création du fichier .env depuis les variables d'environnement..."
cat > /var/www/.env << EOF
APP_NAME=${APP_NAME:-CRPM}
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=${SESSION_SECURE_COOKIE:-true}
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=${CACHE_STORE:-database}

LOG_CHANNEL=${LOG_CHANNEL:-stderr}
LOG_LEVEL=${LOG_LEVEL:-error}

MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@crpm.app"
MAIL_FROM_NAME="${APP_NAME:-CRPM}"

VITE_APP_NAME="${APP_NAME:-CRPM}"
EOF

echo "==> Attente de la base de données..."
until php /var/www/artisan db:show --json > /dev/null 2>&1; do
    echo "    Base de données non disponible, nouvelle tentative dans 3s..."
    sleep 3
done

echo "==> Migrations..."
php /var/www/artisan migrate --force

echo "==> Seeding..."
php /var/www/artisan db:seed --force

echo "==> Storage link..."
php /var/www/artisan storage:link --force 2>/dev/null || true

echo "==> Démarrage terminé."
