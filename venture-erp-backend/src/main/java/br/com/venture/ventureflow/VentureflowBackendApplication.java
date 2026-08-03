package br.com.venture.ventureflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Bootstraps the Venture ERP Spring application and component scan rooted at
 * {@code br.com.venture.ventureflow}.
 */
@SpringBootApplication
public class VentureflowBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(VentureflowBackendApplication.class, args);
	}

}
