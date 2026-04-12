FROM eclipse-temurin:17-jdk-jammy

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/

RUN ./mvnw clean package -DskipTests -B

EXPOSE 8761

CMD ["java", "-jar", "target/Erukaaaa-0.0.1-SNAPSHOT.jar"]
