package br.com.venture.ventureflow.inventory.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

/**
 * Alternative code that points to an item when data is imported from an external origin.
 *
 * <p>Uniqueness is scoped to (source, code) and not global on purpose: two suppliers may
 * legitimately use the same code for different items.
 */
@Entity
@Table(
        name = "item_aliases",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_item_aliases_source_code",
                columnNames = {"source", "code"}
        )
)
public class ItemAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false, length = 50)
    private String code;

    /** Supplier or external system this code belongs to. */
    @Column(nullable = false, length = 100)
    private String source;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected ItemAlias() {
        // Required by JPA.
    }

    public ItemAlias(String code, String source) {
        this.code = code;
        this.source = source;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Item getItem() {
        return item;
    }

    void setItem(Item item) {
        this.item = item;
    }

    public String getCode() {
        return code;
    }

    public String getSource() {
        return source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
