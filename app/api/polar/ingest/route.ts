app/api/polar/ingest/route.ts

import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
});

export const GET = async (req: Request, res: Response) => {
  await polar.events.ingest({
    events: [
      {
        name: "KYC Verification Meter",
        // Replace with your logic to get the customer id
        externalCustomerId: req.ctx.customerId,
        metadata: {
          route: "/api/metered-route",
          method: "GET",
        },
      },
    ],
  });

  return new Response({ hello: 'world' })
}
