FROM node:20-alpine3.19
RUN apk add --no-cache g++ make py3-pip
RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm install --frozen-lockfile --force
RUN pnpm run -r build

EXPOSE 4200

# Use ENTRYPOINT instead of CMD for the main container process
CMD ["pnpm", "run", "pm2"]
