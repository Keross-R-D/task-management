# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy the parent pom and all module poms first for better layer caching
COPY backend/pom.xml ./pom.xml
COPY backend/taskmanagement-client/pom.xml taskmanagement-client/
COPY backend/taskmanagement-server/pom.xml taskmanagement-server/


RUN mvn dependency:go-offline -B

# Copy the entire backend source code
COPY backend/ .

# 4. Build the application
RUN mvn -pl taskmanagement-server -am clean package \
    -DskipTests -Dmaven.javadoc.skip=true


# =======================
# Runtime Image
# =======================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create user and group
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built JAR from builder stage
COPY --from=builder /build/taskmanagement-server/target/*.jar app.jar

# Create directories and set permissions
RUN mkdir -p /var/dms_storage /app/logs /app/bpmn && \
    chown -R spring:spring /var/dms_storage /app/logs /app

# Copy BPMN files
# NOTE: This expects a 'bpmn' folder in your project root
COPY --chown=spring:spring bpmn/ /app/bpmn/


USER spring
EXPOSE 8071

# Environment setup
ENV IKON_ACCESSMANAGEMENT_INIT_FILE=/app/bpmn/project.json
ENV IKON_PROCESSENGINE_BPMN_PATH=/app/bpmn
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
