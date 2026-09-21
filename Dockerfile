FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV HOST=0.0.0.0
ENV PORT=8081
EXPOSE 8081
USER node
CMD ["npm", "start"]
