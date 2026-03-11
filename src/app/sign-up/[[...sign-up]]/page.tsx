import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>
            <div className="relative z-10">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-xl",
                        },
                    }}
                />
            </div>
        </div>
    );
}
