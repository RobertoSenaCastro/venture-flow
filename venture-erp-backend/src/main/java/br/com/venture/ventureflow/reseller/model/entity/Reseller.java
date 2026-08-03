package br.com.venture.ventureflow.reseller.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Persisted reseller that may be associated with sales orders.
 *
 * <p>Document numbers are stored without punctuation and are globally unique.
 * The active flag controls whether the reseller is listed or accepted during
 * sales-order creation and update.</p>
 */
@Entity
@Table(
    name = "resellers",
    uniqueConstraints = {
        @UniqueConstraint(
    		name = "uk_resellers_document_number",
            columnNames = "document_number"
        )
    }
)
public class Reseller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "document_type",
        nullable = false,
        length = 4
    )
    private DocumentType documentType;

    @Column(
        name = "document_number",
        nullable = false,
        length = 14
    )
    // Uniqueness is declared by the table constraint above; the service also
    // checks before insertion to provide an earlier failure.
    private String documentNumber;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Reseller() {
    }

    public Reseller(
        String name,
        DocumentType documentType,
        String documentNumber,
        LocalDateTime createdAt
    ) {
        this.name = name;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.createdAt = createdAt;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(
        DocumentType documentType
    ) {
        this.documentType = documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(
        String documentNumber
    ) {
        this.documentNumber = documentNumber;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
