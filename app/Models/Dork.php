<?php

namespace App\Models;

use Database\Factories\DorkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dork extends Model
{
    /** @use HasFactory<DorkFactory> */
    use HasFactory;

    protected $fillable = ['label', 'query', 'is_active', 'last_run_at'];

    protected $casts = [
        'is_active' => 'boolean',
        'last_run_at' => 'datetime',
    ];

    /**
     * @return HasMany<DorkResult, $this>
     */
    public function results(): HasMany
    {
        return $this->hasMany(DorkResult::class);
    }

    /**
     * Split a raw query into its individual, trimmed keyword lines.
     *
     * @return array<int, string>
     */
    public static function splitQuery(?string $query): array
    {
        return collect(preg_split('/\r\n|\r|\n/', (string) $query))
            ->map(fn (string $line): string => trim($line))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * This dork's individual keyword lines (each searched separately).
     *
     * @return array<int, string>
     */
    public function queryLines(): array
    {
        return static::splitQuery($this->query);
    }
}
