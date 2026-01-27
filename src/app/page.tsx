import ChatInterface from "@/components/ChatInterface";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <ChatInterface />
    </AuthGuard>
  );
}
