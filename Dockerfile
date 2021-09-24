FROM node:14.16.0 as build-deps

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN npx browserslist@latest --update-db
RUN yarn build

FROM nginx:1.12-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build-deps /usr/src/app/build .
COPY ./env.sh .
COPY .env.production .

RUN chmod +x env.sh
RUN sed -i 's/listen       80;/listen       443;/' /etc/nginx/conf.d/default.conf

EXPOSE 443
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
