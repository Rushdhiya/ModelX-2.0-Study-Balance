package studyBalance.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String testBackend() {
        return "Study Balance Backend is Running Successfully!";
    }
}