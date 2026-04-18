import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, CheckCircle2, Shield } from "lucide-react";

const PatientLogin = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/my-appointments`,
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Failed to send login link", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 section-padding flex items-start justify-center">
          <div className="max-w-md mx-auto text-center bg-card rounded-xl border p-12">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-5" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Check Your Email</h2>
            <p className="font-body text-sm text-muted-foreground mb-2">
              We've sent a login link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="font-body text-xs text-muted-foreground mb-6">
              Click the link in the email to access your patient portal. The link expires in 1 hour.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="font-body">
              Use a different email
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 section-padding flex items-start justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-2">Patient Portal</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Access Your Appointments
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Enter the email you used to book your appointment. We'll send you a secure login link — no password needed.
            </p>
          </div>

          <form onSubmit={handleMagicLink} className="bg-card rounded-xl border p-8 space-y-5">
            <div>
              <Label className="font-body">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="font-body pl-10"
                  required
                  autoFocus
                />
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1.5">
                Use the same email address you provided when booking.
              </p>
            </div>

            <Button type="submit" disabled={loading || !email.trim()} className="w-full font-body gap-2">
              {loading ? "Sending..." : <>Send Login Link <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <p className="font-body text-xs text-muted-foreground text-center mt-6">
            Don't have an appointment yet?{" "}
            <a href="/book" className="text-primary hover:underline">Book one now</a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default PatientLogin;
