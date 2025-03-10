'use client';

import {useUser} from "@frontend/hooks/use-user";
import {redirect} from "next/navigation";
import {FC, ReactNode} from "react";

export const CanOnboarding: FC<{children: ReactNode}> = (props) => {
    const {children} = props;

    const user = useUser();
    if (user.isLoading) {
        return null;
    }

    if (!user.data.isSuperAdmin) {
        return redirect('/');
    }

    return children;
}