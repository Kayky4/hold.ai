import MainApp from "@/components/MainApp";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <MainApp />
    </AuthGuard>
  );
}
