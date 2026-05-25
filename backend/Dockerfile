# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy backend module POMs first (better layer caching)
COPY backend/pom.xml backend/
COPY backend/task-management-client/pom.xml backend/task-management-client/
COPY backend/task-management-server/pom.xml backend/task-management-server/

# Copy libs (your manually installed JARs)
COPY backend/libs/ backend/libs/

# Copy entire backend source
COPY backend/ backend/

# Build backend
RUN mvn -f backend/pom.xml clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup --system spring && adduser --system spring -G spring

COPY --from=builder /build/backend/task-management-server/target/*.jar app.jar

# Copy BPMN files
#COPY --chown=spring:spring bpmn/ ./bpmn/
#COPY --chown=spring:spring ../bpmn/ ./bpmn/
COPY --chown=spring:spring bpmn/ /app/bpmn/

USER spring

EXPOSE 8070

ENV SPRING_PROFILES_ACTIVE=server
ENV IKON_ACCESSMANAGEMENT_INIT_FILE=/app/bpmn/project.json
ENV IKON_PROCESSENGINE_BPMN_PATH=/app/bpmn
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
