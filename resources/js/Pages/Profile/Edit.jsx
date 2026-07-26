import { Head } from '@inertiajs/react';
import StudioLayout from '@/Layouts/StudioLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <StudioLayout>
            <Head title="Profile" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">Akun</h1>
                <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">Kelola informasi profil, password, dan akun kamu.</p>
            </div>

            <div className="space-y-6">
                <div className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white p-4 shadow-sm sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white p-4 shadow-sm sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>
            </div>
        </StudioLayout>
    );
}
