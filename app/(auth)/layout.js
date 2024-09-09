import { Logout } from "@/actionns/auth-actions";
import "../globals.css";

export const metadata = {
  title: "Next Auth",
  description: "Next.js Authentication",
};

export default function AuthRootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header id="auth-header">
          <p>welocme back!</p>
          <form action={Logout }>
            <button>LogOut</button>
          </form>
        </header>
        {children}
      </body>
    </html>
  );
}
