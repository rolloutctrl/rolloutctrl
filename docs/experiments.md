# Experiments & analytics integration

RolloutCtrl does **not** ship its own experiment-analysis engine. Instead, it
acts as the **source of truth for variant assignment**: it deterministically
decides which variant a user sees and exposes that information to your
application via the SDK. You then forward the variant data to any third-party
analytics or experimentation platform (Google Analytics, PostHog, Amplitude,
Mixpanel, Segment, etc.) where the actual funnel and conversion analysis
happens.

This separation keeps RolloutCtrl focused on rollout control and bucketing,
while letting you reuse the analytics stack you already have.

---

## How it works

1. The RolloutCtrl SDK evaluates a feature flag locally and returns the
   assigned variant (`name`, `payload`, `payloadType`).
2. Your application reads that variant (e.g. via the `useLastVariant` React
   hook or the evaluator result).
3. On every meaningful event (page view, click, signup, purchase, …) you send
   an analytics event annotated with the **feature flag key** and the
   **variant name** the user was exposed to.
4. Your analytics tool segments conversions by variant and computes the
   experiment results.

> RolloutCtrl already reports `VARIANT_EXPOSURE` metrics internally (see
> [Variants → Metrics](variants.md#metrics)), so you can see exposure counts
> in the dashboard. The integration below is for **conversion / funnel
> analysis**, which is out of scope for RolloutCtrl itself.

---

## What to send

Every analytics event tied to an experiment should carry at minimum:

| Field | Source | Example |
| --- | --- | --- |
| `feature` | `flag.key` from the SDK config | `signup-button` |
| `variant` | `result.variant.name` from evaluation | `treatment` |
| `payload` (optional) | `result.variant.payload` | `checkout_v2` |

Keeping the field names consistent across events lets you build a single
funnel per feature flag and slice it by variant.

---

## React + Google Analytics (ReactGA)

```bash
npm install react-ga4
```

Wrap the analytics call in a small helper so the rest of the app does not
need to know which tool is used:

```tsx
import ReactGA from "react-ga4";

export const trackEvent = (
  name: string,
  params?: Record<string, unknown>,
) => {
  ReactGA.event(name, params);
};
```

Then read the active variant with the `useLastVariant` hook from
`@rolloutctrl/react-sdk` and attach it to the relevant event:

```tsx
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLastVariant } from "@rolloutctrl/react-sdk";
import { trackEvent } from "./analytics";

export const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const lastVariant = useLastVariant("signup-button");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsSubmitting(true);

        const session = { name, email };
        localStorage.setItem("session", JSON.stringify(session));

        if (lastVariant) {
          trackEvent("signup", {
            feature: lastVariant.featureFlagKey,
            variant: lastVariant.variantName,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigate("/dashboard");
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, email, lastVariant, navigate],
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};
```

In GA4 you can now build an exploration comparing the `signup` event count
grouped by the `variant` parameter.

---

## React + PostHog

```bash
npm install posthog-js
```

```tsx
import posthog from "posthog-js";

posthog.init("phc_...", { api_host: "https://app.posthog.com" });

export const trackEvent = (
  name: string,
  params?: Record<string, unknown>,
) => {
  posthog.capture(name, params);
};
```

The same component works unchanged — only the `trackEvent` implementation
differs. PostHog also supports the `$feature/<flag-key>` pattern natively, so
you can additionally call:

```tsx
if (lastVariant) {
  posthog.featureFlags.setDistinctId(userId);
  // Optional: register the variant as a person property for cohort analysis
  posthog.people.set({
    [`feature_${lastVariant.featureFlagKey}`]: lastVariant.variantName,
  });
}
```

---

## React + Amplitude

```bash
npm install @amplitude/analytics-browser
```

```tsx
import * as amplitude from "@amplitude/analytics-browser";

amplitude.init("AMPLITUDE_KEY");

export const trackEvent = (
  name: string,
  params?: Record<string, unknown>,
) => {
  amplitude.track(name, params);
};
```

The `feature` / `variant` event properties become available in Amplitude
charts and cohorts without any further configuration.

---

## Server-side (Node.js)

For backend experiments (e.g. different recommendation algorithms), evaluate
the flag with the Server SDK and forward the variant to your analytics
backend:

```ts
import { evaluateFeatureFlag } from "@rolloutctrl/evaluator";
import { Analytics } from "@segment/analytics-node";

const analytics = new Analytics({ writeKey: process.env.SEGMENT_KEY! });

const result = evaluateFeatureFlag(config.flags["recommendations"], {
  key: "user_123",
});

if (result.variant) {
  analytics.track({
    userId: "user_123",
    event: "recommendations_served",
    properties: {
      feature: "recommendations",
      variant: result.variant.name,
    },
  });
}
```

---

## Recommended event taxonomy

To keep experiments comparable across tools, stick to a single convention:

- **Exposure event** — fired once when the user is first exposed to the
  variant (e.g. `experiment_viewed`):
  ```json
  { "feature": "signup-button", "variant": "treatment" }
  ```
- **Conversion events** — fired on each meaningful action (e.g. `signup`,
  `purchase`), carrying the same `feature` / `variant` properties so the
  analytics tool can compute conversion rate per variant.

Firing a dedicated exposure event is preferable to relying on the first
conversion event, because it gives you the true denominator for conversion
rate calculations even when the user never converts.

---

## Tips

- **Send the variant on every related event**, not just the first one. This
  makes the data resilient to session resets and lets you build multi-step
  funnels.
- **Keep field names stable** across experiments (`feature`, `variant`) so
  dashboards are reusable.
- **Do not PII-encode variant names** — they are operational data, not user
  data.
- **Use the same `key` / distinct id** in RolloutCtrl's evaluation context
  and in your analytics tool. This guarantees sticky bucketing in RolloutCtrl
  matches the identity used for analysis.
- **Avoid double-counting**: RolloutCtrl's internal `VARIANT_EXPOSURE` metric
  is for operational monitoring (how often a variant was assigned). The
  events you send to GA / PostHog are the source of truth for conversion
  analysis.
