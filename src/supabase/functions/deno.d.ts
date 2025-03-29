
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>, options?: any): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export * from '@supabase/supabase-js';
}

declare module "https://esm.sh/stripe@12.4.0?target=deno" {
  export default class Stripe {
    constructor(secretKey: string, options?: any);
    // Add stripe methods as needed
    checkout: {
      sessions: {
        create: (options: any) => Promise<any>;
      }
    }
    // Add other Stripe properties as needed
  }
}

declare module "https://deno.land/x/webidl@v0.2.1/mod.ts" {
  // Add any interfaces or functions you need here
}

declare namespace Deno {
  export function env(name: string): string | undefined;
  export function env(): Record<string, string>;
}
