#!/bin/bash
set -e

echo "==> Attente de la base de données..."
until php /var/www/artisan db:show --json > /dev/null 2>&1; do
    echo "    Base de données non disponible, nouvelle tentative dans 3s..."
    sleep 3
done

echo "==> Migrations..."
php /var/www/artisan migrate --force

echo "==> Seeding (firstOrCreate — sans doublon)..."
php /var/www/artisan db:seed --force

echo "==> Storage link..."
php /var/www/artisan storage:link --force 2>/dev/null || true

echo "==> Cache config & routes..."
php /var/www/artisan config:cache
php /var/www/artisan route:cache

echo "==> Démarrage terminé."
