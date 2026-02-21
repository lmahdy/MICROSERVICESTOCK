package esprit.jobms;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobRestAPI {

    private String hello = "Hello, I'm the Job MS 4TWIN1";

    @RequestMapping("/helloJ")
    public String sayHello() {
        return hello;
    }

    @Autowired
    private JobService jobService;


    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable("id") int id    ) {
        return new ResponseEntity<>(jobService.getJobById(id), HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity<List<Job>> getAll() {
        return new ResponseEntity<>(jobService.getAll(), HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<Job> addJob(@RequestBody Job job) {
        Job createdJob = jobService.addJob(job);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable int id, @RequestBody Job newJob) {
        Job updatedJob = jobService.updateJob(id, newJob);
        if (updatedJob != null) {
            return new ResponseEntity<>(updatedJob, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable int id) {
        String response = jobService.deleteJob(id);
        if (response.equals("Job supprimé")) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
