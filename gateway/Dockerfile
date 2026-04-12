FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/

RUN ./mvnw clean package -DskipTests -B

EXPOSE 9016

CMD ["java", "-jar", "target/ApiGateway-0.0.1-SNAPSHOT.jar"]
