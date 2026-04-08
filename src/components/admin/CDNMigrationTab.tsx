import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MigrationResult {
  success: boolean;
  migrated: number;
  skipped: number;
  failed: number;
  details: any[];
  error?: string;
}

const CDNMigrationTab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigrate = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('migrate-images-cdn');

      if (error) throw error;

      setResult(data);
      if (data.migrated > 0) {
        toast({ title: `✅ Migrated ${data.migrated} images to CDN!` });
      } else {
        toast({ title: 'All images are already on CDN' });
      }
    } catch (err: any) {
      toast({ title: 'Migration failed', description: err.message, variant: 'destructive' });
      setResult({ success: false, migrated: 0, skipped: 0, failed: 1, details: [], error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-gold" />
          CDN Image Migration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Migrate all external images (game icons, package icons, banners, logos) to CDN storage for faster loading worldwide.
        </p>

        <Button
          onClick={handleMigrate}
          disabled={isRunning}
          className="bg-gold hover:bg-gold/90 text-primary-foreground"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              Migrate Images to CDN
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="font-medium">
                {result.success ? 'Migration Complete' : 'Migration Failed'}
              </span>
            </div>

            {result.success && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded bg-green-500/10 text-center">
                  <div className="text-lg font-bold text-green-500">{result.migrated}</div>
                  <div className="text-muted-foreground">Migrated</div>
                </div>
                <div className="p-2 rounded bg-yellow-500/10 text-center">
                  <div className="text-lg font-bold text-yellow-500">{result.skipped}</div>
                  <div className="text-muted-foreground">Skipped</div>
                </div>
                <div className="p-2 rounded bg-destructive/10 text-center">
                  <div className="text-lg font-bold text-destructive">{result.failed}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            )}

            {result.details && result.details.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">View details ({result.details.length} items)</summary>
                <pre className="mt-2 p-2 bg-secondary rounded overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}

            {result.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CDNMigrationTab;
