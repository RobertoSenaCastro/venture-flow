package br.com.venture.ventureflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configures cross-origin access for the REST API.
 *
 * <p>Only the origin supplied by {@code app.cors.allowed-origin} is allowed for
 * {@code /api/**}. The property is backed by {@code FRONTEND_URL}, with the
 * local Vite origin as its default.</p>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String frontendUrl;

    public WebConfig(
        @Value("${app.cors.allowed-origin}")
        String frontendUrl
    ) {
        this.frontendUrl = frontendUrl;
    }

    /**
     * Registers the allowed origin, headers, and HTTP methods for API routes.
     *
     * @param registry Spring MVC CORS registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/api/**")
            .allowedOrigins(frontendUrl)
            .allowedMethods(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
            .allowedHeaders("*");
    }
}
