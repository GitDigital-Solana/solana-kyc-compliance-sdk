name: "grant_compliance_verification_meter",

import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
});

export const GET = async (req: Request, res: Response) => {
  await polar.events.ingest({
    events: [
      {
        name: "some_arbitrary_name",
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
