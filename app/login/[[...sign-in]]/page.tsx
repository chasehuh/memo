import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="zed-login">
      <div className="zed-dialog zed-dialog--clerk">
        <h1 className="zed-dialog__title">memo</h1>
        <p className="zed-dialog__desc">Sign in with GitHub to unlock your notes.</p>
        <SignIn
          routing="path"
          path="/login"
          forceRedirectUrl="/"
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: "memo-clerk-root",
              cardBox: "memo-clerk-card-box",
              card: "memo-clerk-card",
              headerTitle: "memo-clerk-hidden",
              headerSubtitle: "memo-clerk-hidden",
              socialButtonsBlockButton: "zed-btn zed-btn-primary memo-clerk-oauth",
              footer: "memo-clerk-footer",
            },
          }}
        />
      </div>
    </main>
  );
}
