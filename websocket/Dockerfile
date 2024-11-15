FROM elixir:1.15.0-alpine

# Install dependencies
RUN apk add --no-cache git build-base && \
    mix local.hex --force && \
    mix local.rebar --force

# Set up the app
WORKDIR /app
COPY . /app
RUN mix deps.get && MIX_ENV=prod mix release

# Expose WebSocket port
EXPOSE 4000

# Start the application
CMD ["_build/prod/rel/websocket/bin/websocket", "start"]
