/**
 * Utilitaires de conversion monétaire.
 *
 * Les taux sont fournis par le backend (HandleInertiaRequests → taux_eur)
 * et proviennent de l'API Frankfurter (données BCE), mis en cache 24 h.
 *
 * Format attendu : { EUR: 1, USD: 1.08, XOF: 655.957, ... }
 * (1 EUR = X devise)
 */

/**
 * Convertit un montant d'une devise source vers une devise cible.
 *
 * @param {number} amount          - Montant source
 * @param {string} from            - Code devise source (ex. 'XOF')
 * @param {string} to              - Code devise cible ('USD', 'EUR', 'locale', ou autre)
 * @param {Object} tauxEur         - Taux vs EUR partagés par le backend
 * @returns {number}
 */
export function convertAmount(amount, from, to, tauxEur = {}) {
    if (!amount && amount !== 0) return 0;
    const n = Number(amount);

    // Pas de conversion nécessaire
    if (!to || to === 'locale' || to === from) return n;

    const fromCode = from?.toUpperCase();
    const toCode   = to?.toUpperCase();

    // Taux : 1 EUR = X devise
    const fromRate = tauxEur[fromCode] ?? 1;   // ex. XOF → 655.957
    const toRate   = tauxEur[toCode]   ?? 1;   // ex. USD → 1.08

    // Conversion via EUR comme pivot
    const inEUR = n / fromRate;
    return Math.round(inEUR * toRate);
}

/**
 * Formate un nombre avec séparateurs de milliers (espace insécable).
 * Ex : 1267145 → "1 267 145"
 */
export function separerMilliers(n) {
    if (!n && n !== 0) return '0';
    return Math.round(Number(n))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

/**
 * Formate et convertit un montant pour l'affichage.
 *
 * @param {number} amount          - Montant source
 * @param {string} sourceCurrency  - Devise du projet/pays (ex. 'XOF')
 * @param {string} displayCurrency - Devise d'affichage globale ('locale', 'USD', 'EUR')
 * @param {Object} tauxEur         - Taux vs EUR fournis par le backend
 * @returns {string}               - Ex : "1 267 145 XOF" ou "2 054 USD"
 */
export function fmt(amount, sourceCurrency = 'XOF', displayCurrency = 'locale', tauxEur = {}) {
    if (!amount && amount !== 0) return '—';

    const display = (!displayCurrency || displayCurrency === 'locale')
        ? (sourceCurrency ?? 'XOF')
        : displayCurrency;

    const converted = (display === sourceCurrency)
        ? Number(amount)
        : convertAmount(amount, sourceCurrency, display, tauxEur);

    return `${separerMilliers(converted)}\u00a0${display}`;
}
