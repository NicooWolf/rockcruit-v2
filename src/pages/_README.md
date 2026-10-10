# Finalized pages → copy into rockcruit-v2/src/pages/

index.astro · services.astro · team.astro · process.astro · faq.astro

("index.html" is produced automatically: Astro builds src/pages/index.astro → dist/index.html)

## Requirements these files assume

- Layout.astro + Nav/Footer mounted (Steps 3–4), site set in astro.config (Step 3.0)
- global.css owns: :root vars, resets, body, noise, .reveal, .label-tag, touch-cursor media query
- src/components/HireForm.astro exists (Step 7) — index + services import it
- global.css must also define: --bg-base:#070708 (services page background var; has inline fallback)

## Finalized decisions baked in

- services: shared boxed <HireForm/> replaces the prototype's underline-style form (one form site-wide)
- team/process/faq: NEW pages, no prototypes — built in the existing design system;
  process = v1's real recruitingProcessCards copy; team = v1 "Specialized Knowledge" copy;
  faq = answers grounded only in prototype facts
- team.astro has TODO(team) placeholder member slots — swap in real names/photos
- prefers-reduced-motion: marquee animation disabled for users who request it

## Scripts inside pages

- index: accordion (delegation) + carousel (astro:page-load) — ClientRouter-safe
- faq: accordion (delegation)
