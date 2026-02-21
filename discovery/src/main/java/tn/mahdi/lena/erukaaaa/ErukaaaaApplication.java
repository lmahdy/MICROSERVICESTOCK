package tn.mahdi.lena.erukaaaa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;


@SpringBootApplication
@EnableEurekaServer
public class ErukaaaaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErukaaaaApplication.class, args);
    }

}
