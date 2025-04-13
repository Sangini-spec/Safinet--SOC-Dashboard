
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const EmptyState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium">No incidents match your filters</h3>
          <p className="text-muted-foreground mt-2">Try changing your filter criteria.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
