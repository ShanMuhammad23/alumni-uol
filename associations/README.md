# Association Pages Setup

This directory contains the dynamic association pages.

## Structure

- `index.html` - Lists all associations
- `detail.html` - Template for individual association pages (copy this to each association folder)

## How to Create Association Pages

For each association, create a folder with the association slug and copy `detail.html` as `index.html`:

Example:
- `/associations/allied-health-sciences/index.html` (copy of detail.html)
- `/associations/arts-architecture/index.html` (copy of detail.html)
- etc.

The page will automatically detect the association slug from the URL path and load the appropriate data from `/assets/data/associations.json`.

## Association Slugs

All association slugs are defined in `/assets/data/associations.json`:
- allied-health-sciences
- arts-architecture
- engineering-technology
- international-qualifications
- information-technology
- languages
- law
- management-sciences
- medicine
- pharmacy
- sciences
- social-sciences

