FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 7058
CMD ["npm", "run", "start:dev"]
