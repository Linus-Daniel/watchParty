'use client';

import { SocketProvider } from "@/context/socketContext";
import { AuthProvider } from "./AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
        <AuthProvider>

      <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
    </>
  );
}
export default Providers;
