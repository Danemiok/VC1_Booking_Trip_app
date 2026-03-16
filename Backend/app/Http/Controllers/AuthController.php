<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Users fetched successfully',
            'data' => User::latest()->get(),
        ]);
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
            'status' => true,
            'code' => 201,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'message' => 'User fetched successfully',
            'data' => $user,
            'status' => true,
            'code' => 200,
        ]);
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();
        if (array_key_exists('password', $validated)) {
            if ($validated['password']) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }
        }
        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->fresh(),
            'status' => true,
            'code' => 200,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
            'status' => true,
            'code' => 200,
        ]);
    }
}
