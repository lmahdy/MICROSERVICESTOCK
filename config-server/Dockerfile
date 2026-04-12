FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src/ src/

RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jdk-jammy

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/target/config-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8888

CMD ["java", "-jar", "app.jar"]
