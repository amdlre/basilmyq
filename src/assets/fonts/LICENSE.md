# IBM Plex Sans Arabic

`ibm-plex-sans-arabic-600.ttf` is part of the IBM Plex typeface, licensed under the
SIL Open Font License 1.1 — https://github.com/IBM/plex/blob/master/LICENSE.txt

It is vendored rather than fetched at runtime because the Open Graph image route
renders Arabic, and `next/og` needs the font bytes locally to do that. Fetching it
per request would add latency and a network dependency to every share preview.
