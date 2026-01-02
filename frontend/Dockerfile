# official node image
FROM node:22-alpine

# set the working directory inside the container
WORKDIR /app

# copy the compiled next.js app
COPY . /app

# Install node dependency
RUN npm install --omit=production

# Expose port
EXPOSE 3000

CMD ["npm", "start"]

