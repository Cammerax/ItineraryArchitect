import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Create an Account</h1>
          <p className="text-stone-500">Sign up to purchase and access itineraries</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-stone-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
