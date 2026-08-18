package br.com.venture.ventureflow.reseller.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidResellerDataException extends RuntimeException {

    public InvalidResellerDataException(String message) {
        super(message);
    }
}
