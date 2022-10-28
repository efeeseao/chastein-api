# Base Image
FROM node:12.16

# User Config
USER node
WORKDIR /home/node/

# Install Dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Copy of project files
COPY . .

# Execusion
CMD ["yarn", "start"]