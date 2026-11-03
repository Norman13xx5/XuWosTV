FROM mcr.microsoft.com/playwright:v1.51.1-jammy

WORKDIR /tests
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY test-responsive.js ./

CMD ["npm", "test"]
