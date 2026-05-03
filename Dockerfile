FROM node:20-slim

# Install dependencies untuk Sharp (image processing)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files dulu (untuk cache layer Docker)
COPY package*.json ./
RUN npm install --production

# Copy semua source code
COPY . .

# Buat folder untuk auth state (akan di-mount ke volume)
RUN mkdir -p /data/auth_info_baileys

# Symlink auth ke volume
RUN ln -s /data/auth_info_baileys /app/auth_info_baileys

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "index.js"]
