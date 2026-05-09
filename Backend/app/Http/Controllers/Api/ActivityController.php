<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    private function buildPublicImageUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($value));

        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?:/[^/]#i', $normalized)) {
            $normalized = preg_replace('#^([a-z]+:)/#i', '$1//', $normalized);
        }

        if (preg_match('#^https?://#i', $normalized)) {
            $path = parse_url($normalized, PHP_URL_PATH) ?? '';
            if ($path && str_contains($path, '/storage/')) {
                $normalized = substr($path, strpos($path, '/storage/') + strlen('/storage/'));
            } else {
                return $normalized;
            }
        }

        $relative = ltrim($normalized, '/');

        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        if (Str::contains($relative, ['..', './', '.\\'])) {
            return null;
        }

        $storagePath = public_path('storage');
        if (is_dir($storagePath) || is_link($storagePath)) {
            return url('/storage/' . $relative);
        }

        return url('/api/files/' . $relative);
    }

    public function index(): JsonResponse
    {
        $activities = Activity::query()
            ->with(['destination:id,name,location,price,image,rating'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Activity $activity) {
                $destination = $activity->destination;

                return [
                    'id' => $activity->id,
                    'destination_id' => $activity->destination_id,
                    'name' => $activity->name,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'price' => (float) $activity->price,
                    'duration_hours' => (int) $activity->duration_hours,
                    'rating' => (float) $activity->rating,
                    'available_spots' => (int) $activity->available_spots,
                    'image' => $this->buildPublicImageUrl($activity->image),
                    'destination' => $destination ? [
                        'id' => $destination->id,
                        'name' => $destination->name,
                        'location' => $destination->location,
                        'price' => (float) $destination->price,
                        'image' => $this->buildPublicImageUrl($destination->image),
                        'rating' => (float) $destination->rating,
                    ] : null,
                    'created_at' => $activity->created_at,
                ];
            });

        return response()->json([
            'data' => $activities,
        ]);
    }
}
