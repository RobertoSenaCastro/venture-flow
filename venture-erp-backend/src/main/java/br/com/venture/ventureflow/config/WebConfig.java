package br.com.venture.ventureflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC customisations.
 *
 * <p>CORS previously lived here through {@code addCorsMappings}. It moved to
 * {@link SecurityConfig} because MVC-level CORS is applied after the security
 * filter chain, so preflight requests were rejected before reaching it. Keeping
 * a second definition here would silently compete with that one.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
