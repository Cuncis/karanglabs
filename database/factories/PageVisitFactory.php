<?php

namespace Database\Factories;

use App\Models\PageVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PageVisit>
 */
class PageVisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'visitor_id' => hash('sha256', $this->faker->uuid()),
            'path' => $this->faker->randomElement(['/', '/terms', '/studio']),
            'referrer' => null,
            'user_agent' => $this->faker->userAgent(),
            'user_id' => null,
            'visited_at' => now(),
        ];
    }
}
