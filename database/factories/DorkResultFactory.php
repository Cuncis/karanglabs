<?php

namespace Database\Factories;

use App\Models\Dork;
use App\Models\DorkResult;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DorkResult>
 */
class DorkResultFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $url = fake()->url();

        return [
            'dork_id' => Dork::factory(),
            'url' => $url,
            'url_hash' => md5($url),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
        ];
    }
}
