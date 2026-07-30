<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageVisit;
use App\Support\WhitelabelPackage;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TrafficController extends Controller
{
    /**
     * Visitor analytics dashboard: headline stats, a daily trend and top pages.
     */
    public function index(): Response
    {
        $today = Carbon::today();

        return Inertia::render('Admin/Traffic', [
            'stats' => [
                'viewsTotal' => PageVisit::count(),
                'visitorsTotal' => PageVisit::distinct('visitor_id')->count('visitor_id'),
                'viewsToday' => PageVisit::where('visited_at', '>=', $today)->count(),
                'visitorsToday' => PageVisit::where('visited_at', '>=', $today)->distinct('visitor_id')->count('visitor_id'),
                'views7d' => PageVisit::where('visited_at', '>=', $today->copy()->subDays(6))->count(),
                'visitors7d' => PageVisit::where('visited_at', '>=', $today->copy()->subDays(6))->distinct('visitor_id')->count('visitor_id'),
            ],
            'daily' => $this->dailySeries(14),
            'topPages' => $this->topPages(30),
            'hasPackage' => WhitelabelPackage::configured(),
        ]);
    }

    /**
     * Views + unique visitors per day for the last $days days, gaps filled with 0.
     *
     * @return list<array{date: string, label: string, views: int, visitors: int}>
     */
    private function dailySeries(int $days): array
    {
        $from = Carbon::today()->subDays($days - 1);

        $views = PageVisit::where('visited_at', '>=', $from)
            ->selectRaw('DATE(visited_at) as day')
            ->selectRaw('COUNT(*) as aggregate')
            ->groupBy('day')
            ->pluck('aggregate', 'day')
            ->all();

        $visitors = PageVisit::where('visited_at', '>=', $from)
            ->selectRaw('DATE(visited_at) as day')
            ->selectRaw('COUNT(DISTINCT visitor_id) as aggregate')
            ->groupBy('day')
            ->pluck('aggregate', 'day')
            ->all();

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $from->copy()->addDays($i);
            $key = $date->toDateString();
            $series[] = [
                'date' => $key,
                'label' => $date->format('d M'),
                'views' => (int) ($views[$key] ?? 0),
                'visitors' => (int) ($visitors[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Most visited paths over the last $days days.
     *
     * @return list<array{path: string, views: int, visitors: int}>
     */
    private function topPages(int $days): array
    {
        return PageVisit::where('visited_at', '>=', Carbon::today()->subDays($days - 1))
            ->select('path')
            ->selectRaw('COUNT(*) as views')
            ->selectRaw('COUNT(DISTINCT visitor_id) as visitors')
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'path' => $row->path,
                'views' => (int) $row->views,
                'visitors' => (int) $row->visitors,
            ])
            ->all();
    }
}
