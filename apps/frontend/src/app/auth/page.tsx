import {redirect} from "next/navigation";

export default function AuthPage() {
    return redirect("/auth/login");
}