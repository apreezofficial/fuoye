'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/profile');
    }, [router]);
    return null;
}
