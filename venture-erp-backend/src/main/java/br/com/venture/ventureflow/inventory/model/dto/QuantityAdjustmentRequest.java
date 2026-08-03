package br.com.venture.ventureflow.inventory.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Absolute stock count correction.
 *
 * <p>The reason is required but only logged for now; it becomes the description of a
 * movement record once the ledger exists.
 */
public record QuantityAdjustmentRequest(

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.000", message = "Quantity must be zero or positive")
        @Digits(integer = 9, fraction = 3, message = "Quantity accepts at most 3 decimal places")
        BigDecimal quantity,

        @NotBlank(message = "Reason is required")
        @Size(max = 255, message = "Reason must have at most 255 characters")
        String reason
) {
}
