<?php

namespace Database\Factories;

use App\Models\EngineRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EngineRequest>
 */
class EngineRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'message' => fake()->sentence(12),
            'status' => EngineRequest::STATUS_PENDING,
        ];
    }

    public function done(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => EngineRequest::STATUS_DONE,
        ]);
    }
}
