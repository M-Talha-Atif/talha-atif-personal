# Use with any Spring Boot project (generate one at https://start.spring.io:
# Maven, Java 21, deps: Spring Web, Actuator, Spring Data JPA, PostgreSQL Driver)
# Put this Dockerfile next to pom.xml and mvnw.

# ---------- Stage 1: build ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Download deps first â†’ cached unless pom.xml changes
RUN --mount=type=cache,target=/root/.m2 ./mvnw -q dependency:go-offline
COPY src src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -q package -DskipTests
# Split the fat jar into layers (deps change rarely, your code often)
RUN java -Djarmode=layertools -jar target/*.jar extract --destination extracted

# ---------- Stage 2: runtime (JRE only) ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r -u 1001 spring
USER spring

COPY --from=build /workspace/extracted/dependencies/ ./
COPY --from=build /workspace/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/extracted/application/ ./

EXPOSE 8080
# JVM sizes heap from the container memory limit
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

# Spring boots slowly â†’ generous start-period. Needs the Actuator dependency.
HEALTHCHECK --interval=20s --timeout=3s --start-period=45s --retries=3 \
  CMD curl -fs http://127.0.0.1:8080/actuator/health || exit 1

# Spring Boot 3.2+ launcher class
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
