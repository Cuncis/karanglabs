<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudioAccountService;
use App\Support\WhitelabelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private StudioAccountService $accounts) {}

    /**
     * List every user with their login level.
     */
    public function index(): Response
    {
        $adminEmails = config('studio.admin_emails', []);

        $users = User::latest()->limit(200)->get([
            'id', 'name', 'email', 'role', 'has_studio_access', 'license_key', 'created_at',
        ])->map(fn (User $user): array => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_label' => $user->roleLabel(),
            'is_email_admin' => in_array($user->email, $adminEmails, true),
            'has_studio_access' => (bool) $user->has_studio_access,
            'license_key' => $user->license_key,
            'created_at' => $user->created_at,
        ]);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => [User::ROLE_MEMBER, User::ROLE_RESELLER, User::ROLE_ADMIN],
            'stats' => [
                'total' => User::count(),
                'admin' => User::where('role', User::ROLE_ADMIN)->count(),
                'reseller' => User::where('role', User::ROLE_RESELLER)->count(),
                'member' => User::where('role', User::ROLE_MEMBER)->count(),
            ],
            'hasPackage' => WhitelabelPackage::configured(),
        ]);
    }

    /**
     * Update a user's name and email. Admin-only editing of any account.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
        ]);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', "Data {$user->email} diperbarui.");
    }

    /**
     * Change a user's login level.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, 'Kamu tidak bisa mengubah role sendiri.');

        $validated = $request->validate([
            'role' => ['required', Rule::in([User::ROLE_MEMBER, User::ROLE_RESELLER, User::ROLE_ADMIN])],
        ]);

        $this->accounts->assignRole($user, $validated['role']);

        return back()->with('success', "Role {$user->email} diperbarui jadi {$validated['role']}.");
    }

    /**
     * Permanently remove a user. Only admins can do this, and never to
     * themselves or the primary admin configured via ADMIN_EMAILS.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, 'Kamu tidak bisa menghapus akun sendiri.');
        abort_if(in_array($user->email, config('studio.admin_emails', []), true), 403, 'Admin utama tidak bisa dihapus.');

        $email = $user->email;
        $user->delete();

        return back()->with('success', "User {$email} dihapus.");
    }
}
