<?php

namespace Database\Factories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'phone' => fake()->numerify('08##########'),
            'tier' => Subscription::TIER_TOOLS,
            'status' => Subscription::STATUS_PENDING,
            'mayar_member_id' => fake()->unique()->bothify('MBR#######'),
            'mayar_product_id' => fake()->uuid(),
        ];
    }

    public function bundle(): static
    {
        return $this->state(fn (array $attributes) => ['tier' => Subscription::TIER_BUNDLE]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Subscription::STATUS_ACTIVE,
            'next_payment_at' => now()->addMonth(),
        ]);
    }
}
