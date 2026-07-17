<?php

namespace App\Models;

use Database\Factories\DorkResultFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DorkResult extends Model
{
    /** @use HasFactory<DorkResultFactory> */
    use HasFactory;

    protected $fillable = ['dork_id', 'url', 'url_hash', 'title', 'description'];

    /**
     * @return BelongsTo<Dork, $this>
     */
    public function dork(): BelongsTo
    {
        return $this->belongsTo(Dork::class);
    }
}
