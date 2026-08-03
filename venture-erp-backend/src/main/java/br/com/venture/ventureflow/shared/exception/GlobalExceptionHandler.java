package br.com.venture.ventureflow.shared.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts selected application exceptions into consistent REST error bodies.
 *
 * <p>Missing JPA entities become HTTP 404 responses, while Bean Validation
 * failures become HTTP 400 responses grouped by field. Exceptions not declared
 * here continue through Spring's default error handling.</p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Builds the not-found response used for missing sales orders.
     *
     * @param exception exception containing the missing-resource message
     * @return timestamped HTTP 404 body
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(
            EntityNotFoundException exception
    ) {
        Map<String, Object> body = new HashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(body);
    }

    /**
     * Converts request-body Bean Validation failures into field messages.
     *
     * <p>If a field has multiple failures, the map retains the last message
     * encountered for that field.</p>
     *
     * @param exception validation exception raised by Spring MVC
     * @return timestamped HTTP 400 body with a field-to-message map
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> fieldErrors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        fieldErrors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> body = new HashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation failed");
        body.put("fields", fieldErrors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }
}
