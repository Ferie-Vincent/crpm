<?php

namespace App\Imports;

use App\Models\Beneficiaire;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\DB;

class BeneficiairesImport implements ToCollection, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    public function __construct(private ?int $paysId = null) {}

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                $data = $row->toArray();

                Beneficiaire::create([
                    'pays_id'            => $this->paysId,
                    'nom'                => $data['nom'] ?? '',
                    'prenom'             => $data['prenom'] ?? null,
                    'genre'              => isset($data['genre']) ? strtoupper($data['genre']) : null,
                    'telephone'          => $data['telephone'] ?? null,
                    'commune'            => $data['commune'] ?? null,
                    'village'            => $data['village'] ?? null,
                    'activite_principale' => $data['activite_principale'] ?? null,
                    'meta'               => array_diff_key($data, array_flip([
                        'nom', 'prenom', 'genre', 'telephone', 'commune', 'village', 'activite_principale',
                    ])),
                ]);
            }
        });
    }

    public function batchSize(): int
    {
        return 500;
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
