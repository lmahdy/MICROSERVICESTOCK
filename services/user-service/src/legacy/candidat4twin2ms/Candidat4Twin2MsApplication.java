package esprit.candidat4twin2ms;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class Candidat4Twin2MsApplication {

    public static void main(String[] args) {
        SpringApplication.run(Candidat4Twin2MsApplication.class, args);
    }
    @Autowired
    private CandidatRepository repository;
    @Bean
    ApplicationRunner init() {
        return (args) -> {
// save
            repository.save(new Candidat("Mariem", "Ch", "ma@esprit.tn"));
            repository.save(new Candidat("Sarra", "ab", "sa@esprit.tn"));
            repository.save(new Candidat("Mohamed", "ba", "mo@esprit.tn"));
            repository.save(new Candidat("Maroua", "dh", "maroua@esprit.tn"));
// fetch
            repository.findAll().forEach(System.out::println);
        };
    }
}
