import Link from "next/link";
import { Search, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Looking to Hire */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-green-400 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 rounded-lg bg-green-100 p-2 w-fit dark:bg-green-900/20">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Looking to Hire?</CardTitle>
              <CardDescription>
                Find the perfect student developer for your team. Browse through our curated talent pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Access verified student profiles
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Filter by skills and experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Direct messaging system
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                <Link href="/directory">Browse Talent</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Search Effortlessly */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-green-400 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 rounded-lg bg-green-100 p-2 w-fit dark:bg-green-900/20">
                <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Search Effortlessly</CardTitle>
              <CardDescription>
                Our powerful search engine helps you find exactly what you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Advanced filtering options
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Skill-based matching
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Real-time search results
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                <Link href="/directory">Start Searching</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Export Details */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-green-400 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 rounded-lg bg-green-100 p-2 w-fit dark:bg-green-900/20">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Export Details</CardTitle>
              <CardDescription>
                Download and share candidate information in various formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  PDF and CSV exports
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Customizable templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Batch export options
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                <Link href="/export">Export Options</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
} 