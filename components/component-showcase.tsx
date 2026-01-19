import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function ComponentShowcase() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold">Ember Ascent Component Showcase</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui Setup Complete</CardTitle>
          <CardDescription>
            All components are installed with Ember Ascent brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="flex gap-2">
            <Badge>Foundation</Badge>
            <Badge variant="secondary">Standard</Badge>
            <Badge variant="outline">Challenge</Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Progress Example</p>
            <Progress value={65} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
