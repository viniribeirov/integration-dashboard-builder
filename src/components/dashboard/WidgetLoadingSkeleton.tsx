
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WidgetLoadingSkeletonProps {
  isLarge?: boolean;
}

const WidgetLoadingSkeleton: React.FC<WidgetLoadingSkeletonProps> = ({ isLarge = false }) => {
  return (
    <Card className={`shadow-sm h-full ${isLarge ? 'col-span-2' : ''}`}>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-[150px] w-full" />
      </CardContent>
    </Card>
  );
};

export default WidgetLoadingSkeleton;
