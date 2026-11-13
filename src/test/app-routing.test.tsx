import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";

describe("Complete SaaS Application Routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  const routesToTest = [
    "/",
    "/products",
    "/customers",
    "/transactions",
    "/campaigns",
    "/assistant",
    "/analytics",
    "/growth-plan",
    "/reports",
    "/settings",
    "/login",
    "/signup",
    "/onboarding",
  ];

  routesToTest.forEach((path) => {
    it(`correctly matches route for ${path}`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    });
  });
});
