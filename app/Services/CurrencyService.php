<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    /**
     * Currencies targeted by this project — we add fallback rates
     * for those not covered by the Frankfurter / ECB feed.
     * All rates are expressed as "1 EUR = X <currency>".
     */
    const FALLBACK_RATES = [
        'XOF' => 655.957,  // peg officiel BCEAO
        'XAF' => 655.957,  // peg officiel BEAC
        'KMF' => 491.968,  // peg officiel Comores
        'MGA' => 4900.0,   // Ariary malgache (approx)
        'GNF' => 9500.0,   // Franc guinéen   (approx)
        'USD' => 1.08,     // 1 EUR ≈ 1.08 USD
        'EUR' => 1.0,
    ];

    /**
     * Returns exchange rates expressed as "1 EUR = X <currency>".
     * Fetched from the Frankfurter API (ECB data) and cached 24 h.
     *
     * @return array<string, float>
     */
    public static function getRatesVsEur(): array
    {
        return Cache::remember('currency_rates_eur', now()->addHours(24), function () {
            try {
                $response = Http::timeout(5)->get('https://api.frankfurter.app/latest', [
                    'from' => 'EUR',
                ]);

                if ($response->successful()) {
                    $apiRates = $response->json('rates', []);
                    // Merge: API rates override fallbacks; fallback covers missing currencies
                    return array_merge(self::FALLBACK_RATES, ['EUR' => 1.0], $apiRates);
                }
            } catch (\Throwable $e) {
                Log::warning('CurrencyService: impossible de récupérer les taux — fallback utilisé.', [
                    'error' => $e->getMessage(),
                ]);
            }

            return self::FALLBACK_RATES;
        });
    }
}
