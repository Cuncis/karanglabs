<?php

namespace App\Models;

use Database\Factories\StudioProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudioProject extends Model
{
    /** @use HasFactory<StudioProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'engine',
        'title',
        'brief',
        'prompt',
    ];

    protected function casts(): array
    {
        return [
            'brief' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
