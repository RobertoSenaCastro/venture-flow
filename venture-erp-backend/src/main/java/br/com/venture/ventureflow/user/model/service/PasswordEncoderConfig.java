package br.com.venture.ventureflow.user.model.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Supplies the hashing algorithm.
 *
 * <p>This requires only spring-security-crypto, not the full spring-boot-starter-security.
 * Adding the starter now would switch on the default security filter chain and lock
 * every existing endpoint behind a generated password, breaking the running app.
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
