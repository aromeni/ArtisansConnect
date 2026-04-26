import { Card, CardContent } from "@/components/ui/card";
import { Mail, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We&apos;re here to help. Reach out and we&apos;ll respond within one business day.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: Mail,
            title: "Email support",
            desc: "hello@buildersconnect.com.gh",
            note: "General enquiries and account help",
          },
          {
            icon: ShieldCheck,
            title: "Safety & disputes",
            desc: "safety@buildersconnect.com.gh",
            note: "Urgent safety concerns and active disputes",
          },
          {
            icon: Clock,
            title: "Support hours",
            desc: "Mon – Fri, 8am – 6pm GMT",
            note: "We aim to respond within 24 hours",
          },
        ].map(({ icon: Icon, title, desc, note }) => (
          <Card key={title}>
            <CardContent className="pt-6 flex flex-col gap-2">
              <Icon className="h-5 w-5 text-primary-600" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm text-foreground">{desc}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact form — static HTML form, email sending wired in Phase 11 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-lg mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="name">Your name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kwame Mensah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Describe your question or issue..."
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Send message
            </button>

            <p className="text-xs text-muted-foreground">
              This form is not yet wired to email — it will be connected in Phase 11. For urgent issues, email us directly.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
