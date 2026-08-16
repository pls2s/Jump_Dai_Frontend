"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Building2, GraduationCap, KeyRound, PenTool, ShieldCheck } from "lucide-react";

import {
  Button,
  ButtonLink,
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@/components/ui";
import { FRONTEND_DEMO_OTP, type WorkspaceType } from "@/data/mock";
import {
  completeDemoRegistration,
  createAccount,
  enterDemoWorkspace,
  enterFrontendPreview,
  signIn,
  verifyRegistrationOtp,
} from "@/features/auth/services/auth-service";
import { cn } from "@/lib/cn";
import { isFrontendBypassEnabled, isFrontendDemoMode, shouldUseFrontendMocks } from "@/lib/config";
import { AuthBackLink } from "./auth-shell";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [quickAccessPending, setQuickAccessPending] = useState<WorkspaceType | null>(null);
  const [previewPending, setPreviewPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    searchParams.get("registered")
      ? "Your account was created. Sign in with your new credentials."
      : searchParams.get("signedOut")
        ? "You’ve been signed out safely."
        : "",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submittedEmail = String(data.get("email") ?? "").trim();
    const submittedPassword = String(data.get("password") ?? "");
    if (!/^\S+@\S+\.\S+$/.test(submittedEmail) || !submittedPassword) {
      setError("Enter a valid email address and your password.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const result = await signIn({
        email: submittedEmail,
        password: submittedPassword,
        remember: Boolean(data.get("remember")),
      });
      router.push(result.destination);
    } catch (caught) {
      setError(errorMessage(caught, "We couldn’t sign you in. Check your details and try again."));
    } finally {
      setPending(false);
    }
  }

  async function enterAs(workspaceType: WorkspaceType) {
    setQuickAccessPending(workspaceType);
    setError("");
    try {
      router.push(await enterDemoWorkspace(workspaceType));
    } catch (caught) {
      setError(errorMessage(caught, "Demo access is unavailable."));
    } finally {
      setQuickAccessPending(null);
    }
  }

  function unsupportedAction(label: string) {
    setNotice("");
    setError(`${label} is not available in the current prototype. Use email and password to continue.`);
  }

  async function enterPreview() {
    setPreviewPending(true);
    setError("");
    try {
      router.push(await enterFrontendPreview());
    } catch (caught) {
      setError(errorMessage(caught, "Frontend preview is unavailable."));
    } finally {
      setPreviewPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="type-label text-action-primary">Creator access</p>
      <h1 className="type-h1 mt-2">Welcome back</h1>
      <p className="mt-3 text-text-secondary">Sign in to continue your learning or manage your content.</p>

      {notice && <div role="status" className="type-body-small mt-6 rounded-md bg-blue-50 p-3 text-blue-800">{notice}</div>}

      <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
        {error && <FieldError id="sign-in-error">{error}</FieldError>}
        <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} validation={error ? "error" : "default"} aria-describedby={error ? "sign-in-error" : undefined} required /></Field>
        <Field>
          <div className="flex items-center justify-between gap-4"><FieldLabel htmlFor="password">Password</FieldLabel><button type="button" onClick={() => unsupportedAction("Password reset")} className="type-body-small rounded-sm font-medium text-text-link hover:underline">Forgot password?</button></div>
          <Input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} validation={error ? "error" : "default"} aria-describedby={error ? "sign-in-error" : undefined} required />
        </Field>
        <Checkbox label="Remember me" name="remember" defaultChecked />
        <Button type="submit" size="lg" className="w-full" isLoading={pending} loadingLabel="Signing in…">Sign in</Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium tracking-widest text-text-tertiary uppercase"><span className="h-px flex-1 bg-border-default" />or<span className="h-px flex-1 bg-border-default" /></div>
      <Button variant="secondary" size="lg" className="w-full" onClick={() => unsupportedAction("Google sign-in")} disabled={pending}>
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-default text-sm font-bold text-blue-700">G</span>Continue with Google
      </Button>

      {isFrontendDemoMode && (
        <section className="mt-5 rounded-lg border border-border-default bg-neutral-25 p-3.5" aria-labelledby="demo-access-heading">
          <p id="demo-access-heading" className="type-caption font-semibold tracking-wide text-text-secondary uppercase">Demo access</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(["creator", "learner", "organization"] as WorkspaceType[]).map((workspaceType) => (
              <Button key={workspaceType} variant="ghost" size="sm" className="border border-border-default bg-surface-default capitalize" onClick={() => enterAs(workspaceType)} isLoading={quickAccessPending === workspaceType} loadingLabel="Opening…">Enter as {workspaceType}</Button>
            ))}
          </div>
          <p className="type-caption mt-2 text-text-tertiary">Frontend-only sessions for development and UX review.</p>
        </section>
      )}

      {isFrontendBypassEnabled && (
        <div className="mt-4 border-t border-border-default pt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => void enterPreview()} isLoading={previewPending} loadingLabel="Opening preview…">
            Continue to frontend preview
          </Button>
          <p className="type-caption mt-1 text-text-tertiary">Development-only access · no backend authentication</p>
        </div>
      )}

      <p className="mt-8 text-center text-text-secondary">New to SkillSync? <Link href="/create-account" className="font-semibold text-text-link hover:underline">Create an account</Link></p>
    </div>
  );
}

type RegistrationErrors = Partial<Record<"name" | "email" | "password" | "terms" | "form", string>>;

export function CreateAccountForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nextErrors: RegistrationErrors = {};
    if (name.length < 2) nextErrors.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!form.get("terms")) nextErrors.terms = "Accept the terms to create an account.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      router.push(await createAccount({ name, email, password }));
    } catch (caught) {
      setErrors({ form: errorMessage(caught, "We couldn’t create this account. Try again.") });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <AuthBackLink href="/sign-in">Back to sign in</AuthBackLink>
      <h1 className="type-h1">Create your account</h1>
      <p className="mt-3 text-text-secondary">Start building learning experiences from the knowledge you trust.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
        {errors.form && <FieldError id="registration-error">{errors.form}</FieldError>}
        <Field><FieldLabel htmlFor="full-name">Full name</FieldLabel><Input id="full-name" name="name" autoComplete="name" placeholder="Alex Lee" validation={errors.name ? "error" : "default"} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <FieldError id="name-error">{errors.name}</FieldError>}</Field>
        <Field><FieldLabel htmlFor="signup-email">Email</FieldLabel><Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="alex@company.com" validation={errors.email ? "error" : "default"} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <FieldError id="email-error">{errors.email}</FieldError>}</Field>
        <Field><FieldLabel htmlFor="signup-password">Password</FieldLabel><Input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" validation={errors.password ? "error" : "default"} aria-describedby={errors.password ? "password-error" : undefined} />{errors.password && <FieldError id="password-error">{errors.password}</FieldError>}</Field>
        <Field><Checkbox name="terms" label="I agree to the Terms of Service and Privacy Policy." aria-describedby={errors.terms ? "terms-error" : undefined} />{errors.terms && <FieldError id="terms-error">{errors.terms}</FieldError>}</Field>
        <Button type="submit" size="lg" className="w-full" isLoading={pending} loadingLabel="Creating account…">Create account</Button>
      </form>
      <p className="mt-7 text-center text-text-secondary">Already have an account? <Link href="/sign-in" className="font-semibold text-text-link hover:underline">Sign in</Link></p>
    </div>
  );
}

export function OtpForm() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!shouldUseFrontendMocks) {
    return <ContractUnavailable title="Email verification is not connected" description="The current API contract documents no OTP verification or resend endpoint. SkillSync will not submit a guessed request." />;
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length !== 6) return;
    event.preventDefault();
    setDigits(pasted.split(""));
    inputRefs.current[5]?.focus();
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      router.push(await verifyRegistrationOtp(digits.join("")));
    } catch (caught) {
      setError(errorMessage(caught, "The verification code is incorrect."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <AuthBackLink href="/create-account">Back</AuthBackLink>
      <span className="flex size-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><KeyRound className="size-5" aria-hidden="true" /></span>
      <h1 className="type-h1 mt-5">Check your email</h1>
      <p className="mt-3 text-text-secondary">Enter the six-digit development code to continue.</p>
      <form onSubmit={verify} className="mt-8" noValidate>
        <fieldset><legend className="sr-only">Six digit verification code</legend><div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>{digits.map((digit, index) => <Input key={index} ref={(node) => { inputRefs.current[index] = node; }} aria-label={`Digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} validation={error ? "error" : "default"} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKey(index, event)} className="px-0 text-center text-xl font-semibold" />)}</div></fieldset>
        {error && <FieldError id="otp-error" className="mt-4">{error}</FieldError>}
        <p className="type-caption mt-4 rounded-md bg-yellow-50 p-3 text-neutral-700">Frontend Demo Mode code: <strong>{FRONTEND_DEMO_OTP}</strong></p>
        <Button type="submit" size="lg" className="mt-7 w-full" disabled={digits.some((digit) => !digit)} isLoading={pending} loadingLabel="Verifying…">Verify and continue</Button>
      </form>
      {isFrontendBypassEnabled && (
        <ButtonLink href="/account-type" variant="ghost" size="sm" className="mt-3 w-full">Continue in preview mode</ButtonLink>
      )}
    </div>
  );
}

const accountOptions = [
  { id: "learner", title: "Learn and grow", description: "Build skills through guided learning experiences.", icon: GraduationCap },
  { id: "creator", title: "Create learning content", description: "Turn trusted knowledge into structured courses.", icon: PenTool },
  { id: "organization", title: "Represent an organization", description: "Coordinate learning for a team or business.", icon: Building2 },
] as const;

export function AccountTypeForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<WorkspaceType>("creator");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!shouldUseFrontendMocks) {
    return <ContractUnavailable title="Workspace selection is not connected" description="The current API response has no role or workspace field, and no account-type endpoint is documented." />;
  }

  async function continueToWorkspace() {
    setPending(true);
    setError("");
    try {
      router.push(await completeDemoRegistration(selected));
    } catch (caught) {
      setError(errorMessage(caught, "We couldn’t create this demo workspace."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <AuthBackLink href="/verify-otp">Back</AuthBackLink>
      <h1 className="type-h1">How will you use SkillSync?</h1>
      <p className="mt-3 text-text-secondary">Choose the frontend experience that best matches your goal.</p>
      <div className="mt-7 grid gap-3" role="radiogroup" aria-label="Account type">
        {accountOptions.map(({ id, title, description, icon: Icon }) => {
          const checked = selected === id;
          return <button key={id} type="button" role="radio" aria-checked={checked} onClick={() => setSelected(id)} className={cn("flex items-start gap-4 rounded-lg border p-4 text-left transition", checked ? "border-action-primary bg-blue-50 ring-3 ring-blue-100" : "border-border-default bg-surface-default hover:bg-neutral-25")}><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", checked ? "bg-action-primary text-white" : "bg-neutral-100 text-text-secondary")}><Icon className="size-5" aria-hidden="true" /></span><span><span className="block font-semibold text-text-primary">{title}</span><span className="type-body-small mt-1 block text-text-secondary">{description}</span></span></button>;
        })}
      </div>
      {error && <FieldError className="mt-4">{error}</FieldError>}
      <Button size="lg" className="mt-7 w-full" onClick={continueToWorkspace} isLoading={pending} loadingLabel="Opening workspace…">Continue</Button>
      <p className="type-caption mt-4 flex items-center justify-center gap-1.5 text-text-tertiary"><ShieldCheck className="size-4" aria-hidden="true" />Admin access is system-assigned and cannot be selected.</p>
    </div>
  );
}

function ContractUnavailable({ title, description }: { title: string; description: string }) {
  return (
    <div className="w-full">
      <AuthBackLink href="/sign-in">Back to sign in</AuthBackLink>
      <span className="flex size-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><KeyRound className="size-5" aria-hidden="true" /></span>
      <h1 className="type-h1 mt-5">{title}</h1>
      <p className="mt-3 text-text-secondary">{description}</p>
      <ButtonLink href="/sign-in" size="lg" className="mt-7 w-full">Return to sign in</ButtonLink>
    </div>
  );
}
