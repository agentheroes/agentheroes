FROM node:20-alpine3.19
RUN apk add --no-cache g++ make py3-pip
RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

EXPOSE 4200

CMD ["pm2-runtime", "ecosystem.docker.config.js", "--attach"]
