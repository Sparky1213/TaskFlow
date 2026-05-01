import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login, signup, loading } = useAuth();
  const { showToast } = useToast();
  // const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      // navigate("/");
    } catch {
      showToast(
        isSignup
          ? "Signup failed. Email may already be in use."
          : "Login failed. Check your credentials.",
        "error",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#0052CC" />
              <path
                d="M11 13h18M11 20h12M11 27h7"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="auth-title">
            {isSignup ? "Create your account" : "Log in to TaskFlow"}
          </h1>
          <p className="auth-subtitle">
            {isSignup
              ? "Start managing your team's tasks efficiently"
              : "Welcome back! Enter your credentials"}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
            </button>
          </form>

          <div className="auth-switch">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              className="auth-switch-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
