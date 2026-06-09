import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import data from "@/app/admin/dashboard/data.json";

type TemplatePlaceholderPageProps = {
  title: string;
  description?: string;
};

export function TemplatePlaceholderPage({
  title,
  description = "Use this workspace to stage dashboard content later.",
}: TemplatePlaceholderPageProps) {
  return (
    <>
      <div className="px-4 lg:px-6">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <CardAction>
              <Badge variant="outline">Placeholder</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-3">
              <Label htmlFor={`${title}-name`}>Name</Label>
              <Input id={`${title}-name`} defaultValue="Untitled section" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor={`${title}-status`}>Status</Label>
              <Select defaultValue="draft">
                <SelectTrigger id={`${title}-status`} className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Quick Create</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
