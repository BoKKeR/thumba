FROM node:16-alpine AS runner
ARG RELEASE
ENV RELEASE=$RELEASE

WORKDIR /app
COPY . .

RUN npm ci

EXPOSE 10010

CMD ["./start.sh"]
