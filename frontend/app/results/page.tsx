'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamHistoryRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/results');
    }, [router]);
    return null;
}
