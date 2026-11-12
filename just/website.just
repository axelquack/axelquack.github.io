# Website. Lives at just/website.just.
# The root justfile loads it with: import 'just/website.just'
# These recipes build and serve the presence site. They do not deploy.

# Build the presence site.
build:
    npm run build

# Serve the presence site locally.
serve:
    npm run dev
