import React from "react";
import { WebsiteCard } from "@/components/ui/website-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Website = {
  id: number;
  domain: string;
  category: string;
  time: number; // in seconds
  icon?: string;
  color?: string;
};

interface TopWebsitesProps {
  topWebsites?: Website[];
  isLoading: boolean;
}

const colorMap: { [key: string]: string } = {
  "Entertainment": "red",
  "Social Media": "blue",
  "Productivity": "green",
  "Development": "gray",
  "Shopping": "amber",
  "News": "purple",
  "Education": "indigo"
};

export default function TopWebsites({ topWebsites, isLoading }: TopWebsitesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Websites</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full mt-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate max time for percentage calculation
  const maxTime = topWebsites && topWebsites.length > 0 
    ? Math.max(...topWebsites.map(site => site.time))
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Top Websites</CardTitle>
          <Button variant="link" size="sm" className="text-primary hover:text-primaryDark">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!topWebsites || topWebsites.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">No website data available</p>
            <p className="text-sm text-neutral-400 mt-2">
              Start browsing to collect website usage data
            </p>
          </div>
        ) : (
          topWebsites.map((website) => (
            <WebsiteCard
              key={website.id}
              domain={website.domain}
              category={website.category}
              time={website.time}
              percentage={maxTime > 0 ? (website.time / maxTime) * 100 : 0}
              icon={website.icon}
              color={website.color || colorMap[website.category] || "gray"}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
