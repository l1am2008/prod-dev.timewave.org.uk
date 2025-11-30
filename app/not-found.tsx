import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Construction className="w-24 h-24 text-primary animate-bounce" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Oops! You've hit a speed bump!</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for seems to have wandered off the airwaves.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/schedule">View Schedule</Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you feel this is incorrect, please email{" "}
            <a href="mailto:webmaster@cymatic.group" className="text-primary hover:underline font-medium">
              webmaster@cymatic.group
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
